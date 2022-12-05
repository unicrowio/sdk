import React from 'react'
import {
  EscrowStatus,
  IChallengeModalProps,
  IChallengeTransactionCallbacks,
  IChallengeTransactionPayload,
  IGetEscrowData
} from '../../typing'
import {
  Subtitle,
  StyledButton,
  Amount,
  ScopedModal,
  ArbitrationDataDisplayer
} from '../../ui/components'
import {
  ContainerDataDisplayer,
  DataDisplayer
} from '../../ui/components/DataDisplayer'
import { useModalStates } from '../../ui/hooks/useModalStates'
import { addressWithYou, reduceAddress } from '.../../helpers/addressFormat'
import { toast } from '../components/notification/toast'
import { challenge } from '../../core/challenge'
import { displayableAmount } from '../../helpers/displayAmount'
import { getEscrowData } from '../../core/getEscrowData'
import { BUYER, SELLER } from '../../helpers/constants'
import styled from 'styled-components'
import { Forbidden } from '../components/Forbidden'
import { displayChallengePeriod } from '../../helpers/displayChallengePeriod'
import { MARKER } from '../../config/marker'
import { useCountdownChallengePeriod } from '../hooks/useCountdownChallengePeriod'

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const InfoText = styled.p`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  text-align: center;

  color: #322ca2;
`

export function ChallengeModal(props: IChallengeModalProps) {
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

  const [paymentStatus, setPaymentStatus] = React.useState<string | undefined>()

  const {
    buttonLabel,
    disableButton,
    labelChallengePeriod,
    countdown,
    shouldWaitOtherParty
  } = useCountdownChallengePeriod(escrowData)

  React.useEffect(() => {
    setIsLoading(true)
    setLoadingMessage('Getting Escrow information')
    let isMounted = true
    getEscrowData(props.escrowId)
      .then(async (data: IGetEscrowData) => {
        if (!isMounted) {
          return
        }
        setEscrowData(data)

        if (data.status.state === EscrowStatus.CHALLENGED) {
          const who =
            data.status.latestChallenge === data.connectedUser
              ? 'you'
              : data?.status.latestChallenge
          setPaymentStatus(EscrowStatus.CHALLENGED + ' by ' + who)
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
    return () => {
      isMounted = false
    }
  }, [])

  const challengeCallbacks: IChallengeTransactionCallbacks = {
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
    broadcasted: (payload: IChallengeTransactionPayload) => {
      props.callbacks?.broadcasted && props.callbacks.broadcasted(payload)
      setLoadingMessage('Waiting confirmation')
    },
    confirmed: (payload: IChallengeTransactionPayload) => {
      props.callbacks?.confirmed && props.callbacks.confirmed(payload)

      toast('Challenged', 'success')

      setPaymentStatus(
        EscrowStatus.CHALLENGED + ' by ' + escrowData?.connectedUser
      )
      setSuccess(payload.transactionHash)
      setIsLoading(false)
    }
  }

  const onChallenge = () => {
    challenge(props.escrowId, challengeCallbacks).catch(e => {
      setIsLoading(false)
      toast(e, 'error')
    })
  }

  const ModalBody = () => {
    if (!escrowData) {
      return null
    }

    // SIGNED AS SELLER
    const isSeller = escrowData.connectedUser === SELLER

    // SIGNED AS BUYER
    const isBuyer = escrowData.connectedUser === BUYER

    if (!isBuyer && !isSeller) {
      return <Forbidden onClose={onModalClose} />
    }

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
            label="Seller"
            value={addressWithYou(
              escrowData.seller,
              escrowData.connectedWallet
            )}
            copy={escrowData.seller}
            marker={MARKER.seller}
          />
          <DataDisplayer
            label="Buyer"
            value={addressWithYou(escrowData.buyer, escrowData.connectedWallet)}
            copy={escrowData.buyer}
            marker={MARKER.buyer}
          />
          <DataDisplayer label={labelChallengePeriod} value={countdown} />
          <DataDisplayer
            label="Challenge Period Extension"
            value={displayChallengePeriod(escrowData.challengePeriod)}
            marker={MARKER.challengePeriodExtension}
          />
          <DataDisplayer
            label="Marketplace Address"
            value={
              escrowData.marketplace
                ? reduceAddress(escrowData.marketplace)
                : ' - '
            }
            copy={escrowData.marketplace}
            marker={MARKER.marketplace}
          />
          <ArbitrationDataDisplayer data={escrowData} />
        </ContainerDataDisplayer>
      </>
    )
  }

  const Info = ({ message }: { message: string }) => {
    return (
      <InfoContainer>
        <InfoText>{message}</InfoText>
      </InfoContainer>
    )
  }

  const ModalFooter = () => {
    if (!escrowData) {
      return null
    }

    // SIGNED AS SELLER
    const isSeller = escrowData.connectedUser === SELLER

    // SIGNED AS BUYER
    const isBuyer = escrowData.connectedUser === BUYER

    if (!isBuyer && !isSeller) {
      return null
    }

    if (
      isSeller &&
      (escrowData.status.latestChallenge === SELLER ||
        escrowData.status.latestChallenge === null)
    ) {
      return (
        <Info message="You are the current payee. You don't need to challenge." />
      )
    }

    if (isBuyer && escrowData.status.latestChallenge === BUYER) {
      return (
        <Info message="You are the current payee. You don't need to challenge." />
      )
    }

    let buttonChildren
    let buttonOnClick

    if (!escrowData) {
      buttonChildren = buttonLabel
      buttonOnClick = () => ''
    } else if (!error && !success) {
      buttonChildren = buttonLabel
      buttonOnClick = onChallenge
    } else if (success) {
      buttonChildren = 'Close'
      buttonOnClick = onModalClose
    } else {
      buttonChildren = 'Retry'
      buttonOnClick = onChallenge
    }

    return (
      <>
        {!shouldWaitOtherParty && (
          <StyledButton
            fullWidth
            disabled={isLoading || disableButton}
            onClick={buttonOnClick}
          >
            {buttonChildren}
          </StyledButton>
        )}

        {shouldWaitOtherParty && countdown !== 'expired' && (
          <Info message="Wait for the other party to do the challenge." />
        )}
      </>
    )
  }

  return (
    <ScopedModal
      title={'Challenge'}
      body={escrowData ? <ModalBody /> : null}
      footer={escrowData ? <ModalFooter /> : null}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  )
}
