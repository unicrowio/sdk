import React from 'react'
import {
  ISettlementTransactionPayload,
  ISettlementOfferTransactionCallbacks,
  ISettlementOfferModalProps,
  ISettlementApproveModalProps,
  IGetEscrowData,
  OfferSettlementParsedPayload
} from '../../typing'
import { StyledButton } from '../../ui/components/Button'
import { useModalStates } from '../../ui/hooks/useModalStates'
import styled from 'styled-components'
import { offerSettlement } from '../../core/offerSettlement'
import { toast } from '../components/notification/toast'
import { SELLER, BUYER } from '../../helpers/constants'
import { FormattedPercentageAmountAdornment } from '../../ui/components/FormattedPercentageAmountAdornment'
import { renderModal } from '..'
import { ApproveSettlementModal } from './ApproveSettlement'
import { InputText, ScopedModal, Stack } from '../components'
import { AdornmentContent } from '../components/InputText'
import { Forbidden } from '../components/Forbidden'
import { getEscrowData } from '../../core/getEscrowData'

const ContainerButtons = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
`

const LabelFees = styled.div`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;

  margin-top: -10px;

  color: #c4c4c4;
`

const ContainerModalFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export function SettlementOfferModal({
  escrowId,
  escrowData,
  deferredPromise,
  callbacks
}: ISettlementOfferModalProps) {
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    error,
    setError,
    onModalClose
  } = useModalStates({ deferredPromise })

  const _splitBuyer =
    (escrowData && escrowData.settlement?.latestSettlementOfferBuyer) || ''
  const _splitSeller =
    (escrowData && escrowData.settlement?.latestSettlementOfferSeller) || ''

  const [sellerValue, setSellerValue] = React.useState<string>(
    String(_splitSeller)
  )
  const [buyerValue, setBuyerValue] = React.useState<string>(
    String(_splitBuyer)
  )

  const [escrow, setEscrow] = React.useState<IGetEscrowData | null>()

  const [labelBuyer, labelSeller] = React.useMemo(() => {
    if (escrow?.connectedUser === BUYER) {
      return ['You should get back', 'Seller should receive']
    }

    return ['Buyer should get back', 'You should receive']
  }, [escrow])

  React.useEffect(() => {
    if (escrowData) {
      setEscrow(escrowData)
      return
    }

    setIsLoading(true)
    setLoadingMessage('Getting Escrow information')
    getEscrowData(escrowId)
      .then((data: IGetEscrowData) => {
        const settlementModalProps: ISettlementOfferModalProps = {
          escrowId,
          escrowData: data,
          deferredPromise,
          callbacks
        }

        if (data.status.latestSettlementOffer) {
          onModalClose()
          renderModal(ApproveSettlementModal, settlementModalProps)
        }

        setEscrow(data)
      })
      .catch(e => {
        toast(e, 'error')
        onModalClose()
      })
      .finally(() => {
        setLoadingMessage('')
        setIsLoading(false)
      })
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement & { name: 'buyer' | 'seller' }>
  ) => {
    if (event.target.name === 'seller') {
      setSellerValue(event.target.value)
      setBuyerValue(String(100 - Number(event.target.value)))
    } else {
      setSellerValue(String(100 - Number(event.target.value)))
      setBuyerValue(event.target.value)
    }
  }

  const settlementCallbacks: ISettlementOfferTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true)
      setLoadingMessage('Connecting')
      callbacks?.connectingWallet && callbacks.connectingWallet()
    },
    broadcasting: () => {
      setLoadingMessage('Waiting for approval')
      callbacks?.broadcasting && callbacks.broadcasting()
    },
    broadcasted: (payload: ISettlementTransactionPayload) => {
      callbacks?.broadcasted && callbacks.broadcasted(payload)
      setLoadingMessage('Waiting confirmation')
    },
    confirmed: (payload: OfferSettlementParsedPayload) => {
      callbacks?.confirmed && callbacks.confirmed(payload)

      toast('Offer sent with success', 'success')

      setSuccess(payload.transactionHash)
      setIsLoading(false)
    }
  }

  const onSubmitNewOffer = React.useCallback(
    (e: any) => {
      e.preventDefault()
      setIsLoading(true)
      offerSettlement(
        escrowId,
        Number(buyerValue),
        Number(sellerValue),
        settlementCallbacks
      )
        .then(() => {
          setError(null)
          const settlementModalProps: ISettlementApproveModalProps = {
            escrowId,
            deferredPromise,
            callbacks
          }

          renderModal(ApproveSettlementModal, settlementModalProps)
        })
        .catch(e => {
          toast(e, 'error')
        })
        .finally(() => {
          setIsLoading(false)
        })
    },
    [buyerValue, sellerValue]
  )

  const onCancel = () => {
    if (escrow) {
      const settlementModalProps: ISettlementOfferModalProps = {
        escrowId,
        escrowData: escrow,
        deferredPromise,
        callbacks
      }

      renderModal(ApproveSettlementModal, settlementModalProps)
    } else {
      onModalClose()
    }
  }

  const renderButtons = () => {
    if (error) {
      return (
        <StyledButton fullWidth type="submit" variant="secondary">
          Retry
        </StyledButton>
      )
    }

    if (success) {
      return (
        <StyledButton fullWidth variant="primary" onClick={onModalClose}>
          Close
        </StyledButton>
      )
    }

    return (
      <>
        <StyledButton
          fullWidth
          type="button"
          variant="tertiary"
          onClick={onCancel}
        >
          Cancel
        </StyledButton>
        <StyledButton
          variant="primary"
          type="submit"
          disabled={isLoading}
          fullWidth
        >
          Submit
        </StyledButton>
      </>
    )
  }

  const ModalBody = () => {
    if (
      !isLoading &&
      escrow &&
      ![BUYER, SELLER].includes(escrow?.connectedUser)
    ) {
      return <Forbidden onClose={onModalClose} />
    }

    if (escrow?.status.claimed) {
      return (
        <Forbidden
          onClose={onModalClose}
          description="The payment is already claimed"
        />
      )
    }

    return (
      <Stack>
        <InputText
          autoFocus
          required
          disabled={!!success}
          name="buyer"
          id="buyer"
          key="buyer"
          label={labelBuyer}
          placeholder="0"
          onChange={handleChange}
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
                amount={escrow.amount}
                tokenInfo={escrow.token}
                percentage={buyerValue}
              />
            ),
            options: { hideBorder: true }
          }}
        />

        <InputText
          required
          disabled={!!success}
          name="seller"
          id="seller"
          key="seller"
          placeholder="0"
          label={labelSeller}
          value={sellerValue}
          min="0"
          max="100"
          type="number"
          onChange={handleChange}
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>
          }}
          adornmentEnd={{
            content: escrow && (
              <FormattedPercentageAmountAdornment
                amount={escrow.amount}
                tokenInfo={escrow.token}
                percentage={sellerValue}
              />
            ),
            options: { hideBorder: true }
          }}
        />

        {!isLoading && escrow && escrow.connectedUser === SELLER && (
          <LabelFees>
            Fees will be reduced proportionally to your share
          </LabelFees>
        )}
      </Stack>
    )
  }

  const ModalFooter = () => {
    if (!escrow || escrow.status.claimed) {
      return null
    }

    return (
      <ContainerModalFooter>
        <ContainerButtons>{renderButtons()}</ContainerButtons>
      </ContainerModalFooter>
    )
  }

  return (
    <form autoComplete="off" onSubmit={onSubmitNewOffer}>
      <ScopedModal
        title={'Settlement Offer'}
        body={escrow ? ModalBody() : null}
        footer={escrow ? ModalFooter() : null}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </form>
  )
}
