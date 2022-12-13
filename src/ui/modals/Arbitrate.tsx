import React, { ChangeEvent } from 'react'
import {
  InputText,
  Button,
  Stack,
  FormattedPercentageAmountAdornment,
  ScopedModal
} from '../../ui/components'
import { arbitrate, getEscrowData } from '../../core'
import { toast } from '../../ui/components/notification/toast'
import { IArbitrateModalProps, IGetEscrowData } from '../../typing'
import { useModalStates } from '../hooks/useModalStates'
import { AdornmentContent } from '../components/InputText'
import { Forbidden } from '../components/Forbidden'
import { isCorrectNetworkConnected, switchNetwork } from 'wallet'
import { IncorrectNetwork } from 'ui/components/IncorrectNetwork'
import { DefaultNetwork } from 'config/init'

/**
 * Arbitrator should arbitrate the escrow payment
 * @returns
 */
export const Arbitrate = ({
  escrowId,
  deferredPromise,
  callbacks
}: IArbitrateModalProps) => {
  const {
    isLoading,
    loadingMessage,
    setIsLoading,
    setSuccess,
    error,
    setError,
    success,
    onModalClose,
    setLoadingMessage
  } = useModalStates({ deferredPromise })

  const [sellerValue, setSellerValue] = React.useState<string>('')
  const [buyerValue, setBuyerValue] = React.useState<string>('')

  const [escrow, setEscrow] = React.useState<IGetEscrowData | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<boolean>(true)

  const loadData = async () => {
    try {
      setIsLoading(true)

      const isCorrect = await isCorrectNetworkConnected()
      setIsCorrectNetwork(isCorrect)

      if (isCorrect) {
        setLoadingMessage('Getting Arbitration information')

        const escrowData: IGetEscrowData = await getEscrowData(escrowId)

        setEscrow(escrowData)
        if (escrowData.arbitration && escrowData.arbitration.arbitrated) {
          setBuyerValue(escrowData.splitBuyer.toString())
          setSellerValue(escrowData.splitSeller.toString())
        }
      }
    } catch (error: any) {
      console.error(error)
      toast(error.message, 'error')
      onModalClose()
    } finally {
      setLoadingMessage('')
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const confirm = (event: any) => {
    event.preventDefault()

    if (!escrow) return null

    setIsLoading(true)
    arbitrate(
      escrow.escrowId,
      Number(buyerValue),
      Number(sellerValue),
      callbacks
    )
      .then(() => {
        setSuccess('Arbitration Successful')
        setError(null)
        toast('Arbitration Successful', 'success')
      })
      .catch(e => {
        console.error(e)
        setSuccess(null)
        setError(e.message)
        toast(e.message, 'error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'seller') {
      setSellerValue(event.target.value)
      setBuyerValue(String(100 - Number(event.target.value)))
    } else {
      setSellerValue(String(100 - Number(event.target.value)))
      setBuyerValue(event.target.value)
    }
  }

  const onNetworkSwitch = async () => {
    await switchNetwork(globalThis.defaultNetwork.name as DefaultNetwork)
    setIsCorrectNetwork(await isCorrectNetworkConnected())
  }

  const renderBody = () => {
    if (!isCorrectNetwork) {
      return <IncorrectNetwork onClick={onNetworkSwitch} />
    }

    if (!escrow) return null

    if (escrow.connectedUser !== 'arbitrator') {
      return (
        <Forbidden
          onClose={onModalClose}
          description="Only the arbitrator defined in the escrow can arbitrate it"
        />
      )
    }

    return (
      <Stack>
        <InputText
          required
          disabled={!!success || escrow.arbitration?.arbitrated}
          name="seller"
          id="seller"
          label="Seller should receive"
          onChange={handleInputChange}
          value={sellerValue}
          min="0"
          max="100"
          type="number"
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>
          }}
          adornmentEnd={{
            content: escrow && (
              <FormattedPercentageAmountAdornment
                amount={escrow && escrow.amount}
                tokenInfo={escrow && escrow.token}
                percentage={sellerValue}
              />
            ),
            options: { hideBorder: true }
          }}
        />
        <InputText
          required
          disabled={!!success || escrow.arbitration?.arbitrated}
          name="buyer"
          id="buyer"
          label="Buyer should receive"
          onChange={handleInputChange}
          value={buyerValue}
          min="0"
          max="100"
          type="number"
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>
          }}
          adornmentEnd={{
            content: escrow && (
              <FormattedPercentageAmountAdornment
                amount={escrow && escrow.amount}
                tokenInfo={escrow && escrow.token}
                percentage={buyerValue}
              />
            ),
            options: { hideBorder: true }
          }}
        />
      </Stack>
    )
  }

  const renderFooter = () => {
    if (!isCorrectNetwork || !escrow || !escrow.arbitration) {
      return null
    }

    if (
      success ||
      (escrow.connectedUser === 'arbitrator' && escrow.arbitration.arbitrated)
    ) {
      return (
        <Button
          disabled={isLoading}
          fullWidth
          variant="tertiary"
          onClick={onModalClose}
        >
          Close
        </Button>
      )
    }
    if (
      escrow.connectedUser === 'arbitrator' &&
      !escrow.arbitration.arbitrated
    ) {
      return (
        <Button disabled={isLoading} fullWidth variant="primary" type="submit">
          {error ? 'Retry' : 'Confirm'}
        </Button>
      )
    }
  }

  return (
    <form autoComplete="off" onSubmit={confirm}>
      <ScopedModal
        title={'Arbitrate the payment'}
        body={renderBody()}
        footer={renderFooter()}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </form>
  )
}
