import React from "react";
import {
  EscrowStatus,
  IChallengeModalProps,
  IChallengeTransactionCallbacks,
  IChallengeTransactionPayload,
} from "../../../typing";
import {
  Subtitle,
  Button,
  Amount,
  ScopedModal,
  ArbitrationDataDisplayer,
} from "../../../ui/internal/components";
import {
  ContainerDataDisplayer,
  DataDisplayer,
} from "../../../ui/internal/components/DataDisplayer";
import { useModalStates } from "../../../ui/internal/hooks/useModalStates";
import {
  addressWithYou,
  reduceAddress,
  displayableAmount,
  BUYER,
  SELLER,
  displayChallengePeriod,
} from ".../../helpers";
import { toast } from "../notification/toast";
import { challenge } from "../../../core/challenge";
import { getEscrowData } from "../../../core/getEscrowData";
import styled from "styled-components";
import { MARKER } from "../../../config/marker";
import { useCountdownChallengePeriod } from "../hooks/useCountdownChallengePeriod";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { useAsync } from "../hooks/useAsync";
import { SpinnerIcon } from "../assets/SpinnerIcon";
import { ModalAction } from "../components/Modal";
import { ModalBodySkeleton } from "../components/ModalBodySkeleton";

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoText = styled.p`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: #322ca2;
`;

export function ChallengeModal(props: IChallengeModalProps) {
  const { success, setSuccess, setIsLoading, setLoadingMessage, onModalClose } =
    useModalStates({ deferredPromise: props.deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const [escrowData, isLoading, error] = useAsync(
    props.escrowId,
    getEscrowData,
    onModalClose,
    null,
  );

  React.useEffect(() => {
    if (escrowData) {
      if (![BUYER, SELLER].includes(escrowData.connectedUser)) {
        setModalAction({
          isForbidden: true,
        });
      }

      if (escrowData.status.state === EscrowStatus.CHALLENGED) {
        const who =
          escrowData.status.latestChallengeBy === escrowData.connectedUser
            ? "you"
            : escrowData?.status.latestChallengeBy;
        setPaymentStatus(`${EscrowStatus.CHALLENGED} by ${who}`);
        return;
      }

      setPaymentStatus(escrowData.status.state);
    }
  }, [escrowData]);

  const [paymentStatus, setPaymentStatus] = React.useState<string>();

  const {
    buttonLabel,
    disableButton,
    labelChallengePeriod,
    countdown,
    shouldWaitOtherParty,
  } = useCountdownChallengePeriod(escrowData);

  const challengeCallbacks: IChallengeTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true);
      setLoadingMessage("Connecting");
      props.callbacks &&
        props.callbacks.connectingWallet &&
        props.callbacks.connectingWallet();
    },
    connected: (address: string) => {
      setLoadingMessage("Connected");
      props.callbacks &&
        props.callbacks.connected &&
        props.callbacks.connected(address);
    },
    broadcasting: () => {
      setLoadingMessage("Waiting for approval");
      props.callbacks &&
        props.callbacks.broadcasting &&
        props.callbacks.broadcasting();
    },
    broadcasted: (payload: IChallengeTransactionPayload) => {
      props.callbacks &&
        props.callbacks.broadcasted &&
        props.callbacks.broadcasted(payload);
      setLoadingMessage("Waiting confirmation");
    },
    confirmed: (payload: IChallengeTransactionPayload) => {
      props.callbacks &&
        props.callbacks.confirmed &&
        props.callbacks.confirmed(payload);

      toast("Challenged", "success");

      setPaymentStatus(`${EscrowStatus.CHALLENGED} by you`);
      setSuccess(payload);
      setIsLoading(false);
    },
  };

  const onChallenge = () => {
    challenge(props.escrowId, challengeCallbacks).catch((e) => {
      setIsLoading(false);
      toast(e, "error");
    });
  };

  const ModalBody = () => {
    if (!escrowData) {
      return <ModalBodySkeleton />;
    }

    return (
      <>
        <Amount
          precision={escrowData.token.decimals}
          amount={displayableAmount(
            escrowData.amount,
            escrowData.token.decimals,
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
              escrowData.connectedWallet,
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
          <DataDisplayer
            label={labelChallengePeriod}
            value={countdown}
            marker={MARKER.challengePeriod}
          />
          <DataDisplayer
            label="Challenge Period Extension"
            value={displayChallengePeriod(escrowData.challengePeriod)}
            marker={MARKER.challengePeriodExtension}
          />
          <DataDisplayer
            hide={!escrowData?.marketplace}
            label="Marketplace Address"
            value={reduceAddress(
              escrowData.marketplace,
              escrowData.ensAddresses?.marketplace,
            )}
            copy={escrowData.marketplace}
            marker={MARKER.marketplace}
          />
          <ArbitrationDataDisplayer data={escrowData} />
        </ContainerDataDisplayer>
      </>
    );
  };

  const Info = ({ message }: { message: string }) => {
    return (
      <InfoContainer>
        <InfoText>{message}</InfoText>
      </InfoContainer>
    );
  };

  const ModalFooter = () => {
    const isSeller = escrowData?.connectedUser === SELLER; // SIGNED AS SELLER
    const isBuyer = escrowData?.connectedUser === BUYER; // SIGNED AS BUYER

    if (!(escrowData && (isBuyer || isSeller))) {
      return null;
    }

    if (
      isSeller &&
      (escrowData.status.latestChallengeBy === SELLER ||
        escrowData.status.latestChallengeBy === null)
    ) {
      return (
        <Info message="You are the current payee. You don't need to challenge." />
      );
    }

    if (isBuyer && escrowData.status.latestChallengeBy === BUYER) {
      return (
        <Info message="You are the current payee. You don't need to challenge." />
      );
    }

    let buttonChildren;
    let buttonOnClick;

    if (!escrowData) {
      buttonChildren = buttonLabel;
      buttonOnClick = () => "";
    } else if (!(error || success)) {
      buttonChildren = buttonLabel;
      buttonOnClick = onChallenge;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onChallenge;
    }

    return (
      <>
        {!shouldWaitOtherParty && (
          <Button
            fullWidth
            disabled={isLoading || disableButton}
            onClick={buttonOnClick}
          >
            {buttonChildren}
          </Button>
        )}

        {shouldWaitOtherParty && countdown !== "expired" && (
          <>
            <Button fullWidth disabled variant="primary">
              <>
                <SpinnerIcon />
                Challenge period hasn't started yet
              </>
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <div ref={closeHandlerRef}>
      <ScopedModal
        title={"Challenge"}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={isLoading ? "Getting Escrow information" : ""}
      />
    </div>
  );
}
