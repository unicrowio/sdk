import {
  EscrowStatus,
  IGetEscrowData,
  IRefundModalProps,
  IRefundTransactionCallbacks,
  IRefundTransactionPayload
} from '../../typing'
import React from 'react'
import {
  Subtitle,
  Amount,
  StyledButton,
  ScopedModal,
  DataDisplayer
} from '../../ui/components'
import {
  reduceAddress,
  displayableAmount,
  SELLER,
  displayChallengePeriod
} from '../../helpers'
import { toast } from '../../ui/components/notification/toast'
import { refund, getEscrowData } from '../../core'
import { Forbidden } from '../components/Forbidden'
import { MARKER } from '../../config/marker'
import { useModalStates } from 'ui/hooks/useModalStates'
import { ContainerDataDisplayer } from 'ui/components/DataDisplayer'
import { addressWithYou } from 'helpers/addressFormat'
import { useCountdownChallengePeriod } from 'ui/hooks'

type IProtectedActions = {
  canRefund: boolean
  reason?: string
}

export function RefundModal(props: IRefundModalProps) {
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    error,
    onModalClose
  } = useModalStates({ deferredPromise: props.deferredPromise })

  const [escrowData, setEscrowData] = React.useState<IGetEscrowData | null>(
    null
  )

  const [protect, setProtect] = React.useState<IProtectedActions>(
    {} as IProtectedActions
  )

  const [paymentStatus, setPaymentStatus] = React.useState<string | undefined>()

  const { labelChallengePeriod, countdown } =
    useCountdownChallengePeriod(escrowData)

  React.useEffect(() => {
    setIsLoading(true)
    setLoadingMessage('Getting Escrow information')
    getEscrowData(props.escrowId)
      .then(async (data: IGetEscrowData) => {
        setEscrowData(data)
        if (data.connectedUser !== SELLER) {
          setProtect({
            canRefund: false,
            reason: 'Only the seller can release the payment'
          })
          return
        }

        if (data.status.claimed) {
          setProtect({
            canRefund: false,
            reason: 'The payment cannot be refunded via Unicrow anymore'
          })
          return
        }

        setProtect({
          canRefund: true
        })

        if (data.status.state === EscrowStatus.CHALLENGED) {
          setPaymentStatus(
            EscrowStatus.CHALLENGED + ' by ' + data?.status.latestChallenge
          )
          return
        }

        setPaymentStatus(data.status.state)
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

  const refundCallbacks: IRefundTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true)
      setLoadingMessage('Connecting')
      props.callbacks?.connectingWallet && props.callbacks.connectingWallet()
    },
    connected: () => {
      setLoadingMessage('Connected')
      props.callbacks?.connected && props.callbacks.connected()
    },
    broadcasting: () => {
      setLoadingMessage('Waiting for approval')
      props.callbacks?.broadcasting && props.callbacks.broadcasting()
    },
    broadcasted: (payload: IRefundTransactionPayload) => {
      props.callbacks?.broadcasted && props.callbacks.broadcasted(payload)
      setLoadingMessage('Waiting confirmation')
    },
    confirmed: (payload: IRefundTransactionPayload) => {
      props.callbacks?.confirmed && props.callbacks.confirmed(payload)

      toast('Refunded', 'success')
      setPaymentStatus(EscrowStatus.REFUNDED)

      setSuccess(payload.transactionHash)
      setIsLoading(false)
    }
  }

  const onRefund = () => {
    refund(props.escrowId, refundCallbacks).catch(e => {
      setIsLoading(false)
      toast(e, 'error')
    })
  }

  const ModalBody = () => {
    if (!escrowData) {
      return null
    }

    if (!isLoading && !protect.canRefund) {
      return <Forbidden onClose={onModalClose} description={protect.reason} />
    }

    const isExpired = escrowData.challengePeriodEnd.getTime() <= Date.now()
    return (
      <>
        <Amount
          precision={escrowData.token.decimals}
          amount={displayableAmount(
            escrowData.amount,
            escrowData.token.decimals
          )}
          tokenSymbol={escrowData.token.symbol}
          status={paymentStatus}
        />
        <Subtitle>Payment Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            copy={escrowData.seller}
            label="Seller"
            value={addressWithYou(
              escrowData.seller,
              escrowData.connectedWallet
            )}
            marker={MARKER.seller}
          />
          <DataDisplayer
            copy={escrowData.buyer}
            label="Buyer"
            value={addressWithYou(escrowData.buyer, escrowData.connectedWallet)}
            marker={MARKER.buyer}
          />

          {!isExpired && (
            <>
              <DataDisplayer label={labelChallengePeriod} value={countdown} />
              <DataDisplayer
                label="Challenge Period Extension"
                value={displayChallengePeriod(escrowData.challengePeriod)}
                marker={MARKER.challengePeriodExtension}
              />
            </>
          )}
          <DataDisplayer
            copy={escrowData.marketplace}
            label="Marketplace Address"
            value={
              escrowData.marketplace
                ? reduceAddress(escrowData.marketplace)
                : ' - '
            }
            marker={MARKER.marketplace}
          />
        </ContainerDataDisplayer>
      </>
    )
  }

  const ModalFooter = () => {
    if (!isLoading && !protect.canRefund) {
      return null
    }

    let buttonChildren
    let buttonOnClick

    if (!escrowData) {
      buttonChildren = 'Confirm Refund'
      buttonOnClick = () => ''
    } else if (!error && !success) {
      buttonChildren = `Confirm Refund`
      buttonOnClick = onRefund
    } else if (success) {
      buttonChildren = 'Close'
      buttonOnClick = onModalClose
    } else {
      buttonChildren = 'Retry'
      buttonOnClick = onRefund
    }

    return (
      <StyledButton fullWidth disabled={isLoading} onClick={buttonOnClick}>
        {buttonChildren}
      </StyledButton>
    )
  }

  return (
    <ScopedModal
      title={'Refund Payment'}
      body={escrowData ? <ModalBody /> : null}
      footer={<ModalFooter />}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  )
}
