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
  formatAmount,
  BUYER,
  SELLER,
  displayChallengePeriod,
} from ".../../helpers";
import { toast } from "../notification/toast";
import { challenge } from "../../../core/challenge";
import { MARKER } from "../../../config/marker";
import { useCountdownChallengePeriod } from "../hooks/useCountdownChallengePeriod";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { SpinnerIcon } from "../assets/SpinnerIcon";
import { ModalAction } from "../components/Modal";
import { useEscrowData } from "ui/internal/hooks/useEscrowData";

export function ChallengeModal(props: IChallengeModalProps) {
  const {
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose,
  } = useModalStates({ deferredPromise: props.deferredPromise });

  const {
    data: escrowData,
    isLoading: isLoadingEscrow,
    error,
  } = useEscrowData({ escrowId: props.escrowId, refreshInterval: 1000 });

  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [paymentStatus, setPaymentStatus] = React.useState<string>();
  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const isLoadingAnything = isLoadingEscrow || isLoading;

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

  const {
    labelChallengePeriod,
    countdown,
    challengedBy,
    updateChallenge,
    startChallenge,
    startExpired,
    canChallenge,
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
      setLoadingMessage("Waiting for confirmation");
      updateChallenge(escrowData);
    },
    confirmed: (payload: IChallengeTransactionPayload) => {
      props.callbacks &&
        props.callbacks.confirmed &&
        props.callbacks.confirmed(payload);

      toast.success("Challenged");
      startChallenge();

      setPaymentStatus(`${EscrowStatus.CHALLENGED} by you`);
      setSuccess(payload);
      setIsLoading(false);
    },
  };

  const onChallenge = () => {
    challenge(props.escrowId, challengeCallbacks).catch((e) => {
      setIsLoading(false);
      toast.error(e);
    });
  };

  const ModalBody = () => {
    if (!escrowData) {
      return null;
    }

    return (
      <>
        <Amount
          amount={formatAmount(escrowData.amount, escrowData.token.decimals)}
          precision={escrowData.token.decimals}
          tokenSymbol={escrowData.token.symbol}
          status={paymentStatus}
        />
        <Subtitle>Payment Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            label="Seller"
            value={addressWithYou(escrowData.seller, escrowData.walletAddress)}
            copy={escrowData.seller}
            marker={MARKER.seller}
          />
          <DataDisplayer
            label="Buyer"
            value={addressWithYou(escrowData.buyer, escrowData.walletAddress)}
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
          {escrowData.reference ? (
            <DataDisplayer
              label="Reference"
              value={escrowData.reference}
              copy={escrowData.reference}
              marker={MARKER.reference}
            />
          ) : (
            <></>
          )}
        </ContainerDataDisplayer>
      </>
    );
  };

  const ModalFooter = () => {
    const isSeller = escrowData?.connectedUser === SELLER; // SIGNED AS SELLER
    const isBuyer = escrowData?.connectedUser === BUYER; // SIGNED AS BUYER
    const isWaitsForChallenge = challengedBy !== escrowData?.connectedUser;

    if (!(escrowData && (isBuyer || isSeller))) {
      return null;
    }

    if (
      isSeller &&
      (escrowData.status.latestChallengeBy === SELLER ||
        escrowData.status.latestChallengeBy === null)
    ) {
      return (
        <Button fullWidth onClick={() => onModalClose()}>
          Close
        </Button>
      );
    }

    if (isBuyer && escrowData.status.latestChallengeBy === BUYER) {
      return (
        <Button fullWidth onClick={() => onModalClose()}>
          Close
        </Button>
      );
    }

    if (isWaitsForChallenge && !startExpired) {
      return (
        <Button fullWidth disabled variant="primary">
          <>
            <SpinnerIcon />
            Challenge period hasn't started yet
          </>
        </Button>
      );
    }

    let buttonChildren;
    let buttonOnClick;

    if (!escrowData) {
      buttonChildren = "";
      buttonOnClick = () => "";
    } else if (canChallenge) {
      buttonChildren = "Confirm Challenge";
      buttonOnClick = onChallenge;
    } else if (!canChallenge) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else if (error) {
      buttonChildren = "Retry";
      buttonOnClick = onChallenge;
    }

    return (
      <Button fullWidth disabled={isLoadingAnything} onClick={buttonOnClick}>
        {buttonChildren}
      </Button>
    );
  };

  return (
    <div ref={closeHandlerRef}>
      <ScopedModal
        title={"Challenge"}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoadingAnything}
        loadingMessage={loadingMessage}
        modalAction={modalAction}
      />
    </div>
  );
}
