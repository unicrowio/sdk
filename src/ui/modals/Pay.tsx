import React from 'react'
import { getTokenInfo } from '../../core/getTokenInfo'
import {
  EscrowStatus,
  IPaymentModalProps,
  IPayTransactionCallbacks,
  IPayTransactionPayload,
  ITokenInfo
} from '../../typing'
import { pay } from '../../core/pay'
import {
  Subtitle,
  ScopedModal,
  Amount,
  StyledButton
} from '../../ui/components'
import {
  DataDisplayer,
  ContainerDataDisplayer
} from '../../ui/components/DataDisplayer'
import { useModalStates } from '../../ui/hooks/useModalStates'
import { displayChallengePeriod } from '../../helpers/displayChallengePeriod'

import { addressWithYou, reduceAddress } from '../../helpers/addressFormat'
import { toast } from '../components/notification/toast'
import { getWalletAccount } from '../../wallet'
import { ADDRESS_ZERO } from '../../helpers/constants'
import { formatAmount } from '../../helpers/formatAmount'
import { MARKER } from '../../config/marker'

export function PayModal(props: IPaymentModalProps) {
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

  const [modalTitle, setModalTitle] = React.useState('Payment')
  const [paymentStatus, setPaymentStatus] = React.useState<EscrowStatus>(
    EscrowStatus.UNPAID
  )
  const [tokenInfo, setTokenInfo] = React.useState<ITokenInfo>()
  const [buyer, setBuyer] = React.useState<string | null>()

  const [walletUser, setWalletUser] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsLoading(true)
    getWalletAccount().then(account => {
      setWalletUser(account)
    })
    getTokenInfo(props.paymentRequestData.tokenAddress)
      .then(setTokenInfo)
      .catch(() => {
        onModalClose()
      })
      .finally(() => {
        setIsLoading(false)
        setLoadingMessage('')
      })
  }, [])

  const payCallbacks: IPayTransactionCallbacks = {
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
    broadcasted: (payload: IPayTransactionPayload) => {
      props.callbacks?.broadcasted && props.callbacks.broadcasted(payload)
      setLoadingMessage('Waiting confirmation')
    },
    confirmed: (payload: IPayTransactionPayload) => {
      props.callbacks?.confirmed && props.callbacks.confirmed(payload)

      toast('Payment Sent', 'success')
      setModalTitle('Payment Sent')

      setBuyer(payload.buyer)
      setPaymentStatus(EscrowStatus.PAID)

      setSuccess(payload.transactionHash)

      setIsLoading(false)
    }
  }

  const onPayClick = () => {
    pay(props.paymentRequestData, payCallbacks).catch(e => {
      setIsLoading(false)
      toast(e, 'error')
    })
  }

  const ModalBody = () => {
    return (
      <>
        <Amount
          amount={formatAmount(
            props.paymentRequestData.amount,
            tokenInfo?.decimals || 18,
            tokenInfo?.symbol || 'ERR'
          )}
          tokenSymbol={tokenInfo?.symbol ? tokenInfo.symbol : 'ERR'}
          status={paymentStatus}
        />
        <Subtitle>Payment Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            label="Seller ETH/ENS Address"
            value={addressWithYou(props.paymentRequestData.seller, walletUser!)}
            copy={props.paymentRequestData.seller}
            marker={MARKER.seller}
          />
          {buyer && (
            <DataDisplayer
              label="Buyer"
              value={addressWithYou(buyer, walletUser!)}
              copy={buyer}
              marker={MARKER.buyer}
            />
          )}
          <DataDisplayer
            label="Challenge Period"
            value={displayChallengePeriod(
              props.paymentRequestData.challengePeriod
            )}
            marker={MARKER.challengePeriod}
          />
          {props.paymentRequestData.challengePeriodExtension && (
            <DataDisplayer
              label="Challenge Period Extension"
              value={displayChallengePeriod(
                props.paymentRequestData.challengePeriodExtension
              )}
              marker={MARKER.challengePeriodExtension}
            />
          )}
          {props.paymentRequestData.arbitrator && (
            <>
              <DataDisplayer
                label="Arbitrator"
                value={reduceAddress(props.paymentRequestData.arbitrator)}
                copy={props.paymentRequestData.arbitrator}
                marker={MARKER.arbitrator}
              />
              <DataDisplayer
                label="Arbitrator Fee"
                value={`${
                  props.paymentRequestData.arbitratorFee?.toString() || '... '
                }%`}
                marker={MARKER.arbitratorFee}
              />
            </>
          )}
          {props.paymentRequestData.marketplace &&
            props.paymentRequestData.marketplace?.toLowerCase() !==
              ADDRESS_ZERO.toLowerCase() && (
              <DataDisplayer
                label="Marketplace Address"
                value={reduceAddress(props.paymentRequestData.marketplace)}
                copy={props.paymentRequestData.marketplace}
                marker={MARKER.marketplace}
              />
            )}
        </ContainerDataDisplayer>
      </>
    )
  }

  const ModalFooter = () => {
    let buttonChildren
    let buttonOnClick

    if (!error && !success) {
      buttonChildren = `Pay ${props.paymentRequestData.amount} ${
        tokenInfo ? tokenInfo.symbol : '-'
      }`
      buttonOnClick = onPayClick
    } else if (success) {
      buttonChildren = 'Close'
      buttonOnClick = onModalClose
    } else {
      buttonChildren = 'Retry'
      buttonOnClick = onPayClick
    }

    return (
      <StyledButton fullWidth disabled={isLoading} onClick={buttonOnClick}>
        {buttonChildren}
      </StyledButton>
    )
  }

  return (
    <ScopedModal
      title={modalTitle}
      body={<ModalBody />}
      footer={<ModalFooter />}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  )
}
