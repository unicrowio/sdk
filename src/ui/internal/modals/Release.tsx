import {
  EscrowStatus,
  IGetEscrowData,
  IReleasedTransactionPayload,
  IReleaseModalProps,
  IReleaseTransactionCallbacks,
} from "../../../typing";
import React from "react";
import {
  ContainerDataDisplayer,
  DataDisplayer,
} from "../../../ui/internal/components/DataDisplayer";
import {
  Button,
  Subtitle,
  Amount,
  ScopedModal,
} from "../../../ui/internal/components";
import { useModalStates } from "../../../ui/internal/hooks/useModalStates";
import { toast } from "../notification/toast";
import { release } from "../../../core/release";
import { getEscrowData } from "../../../core/getEscrowData";
import { Forbidden } from "../components/Forbidden";
import { MARKER } from "../../../config/marker";
import { addressWithYou, reduceAddress, displayableAmount } from "helpers";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { useCountdownChallengePeriod } from "../hooks/useCountdownChallengePeriod";
import { ModalAction } from "../components/Modal";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

export function ReleaseModal(props: IReleaseModalProps) {
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    error,
    onModalClose,
  } = useModalStates({ deferredPromise: props.deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const { isCorrectNetwork } = useNetworkCheck();

  const [escrowData, setEscrowData] = React.useState<IGetEscrowData | null>(
    null,
  );

  const [paymentStatus, setPaymentStatus] = React.useState<
    string | undefined
  >();

  const [modalAction, setModalAction] = React.useState<ModalAction>(
    {} as ModalAction,
  );

  const { labelChallengePeriod, countdown } =
    useCountdownChallengePeriod(escrowData);

  const loadData = async () => {
    if (isCorrectNetwork) {
      setIsLoading(true);
      setLoadingMessage("Getting Escrow information");
      getEscrowData(props.escrowId)
        .then(async (data: IGetEscrowData) => {
          setEscrowData(data);

          if (data.connectedUser !== "buyer") {
            setModalAction({
              isForbidden: false,
              reason: "Only the buyer can release the payment",
            });
            return;
          }

          if (data.status.claimed) {
            setModalAction({
              isForbidden: false,
              reason: "The payment is already claimed",
            });
            return;
          }

          setPaymentStatus(data.status.state);

          if (data.status.state === EscrowStatus.CHALLENGED) {
            setPaymentStatus(
              `${EscrowStatus.CHALLENGED} by ${data.status.latestChallengeBy}`,
            );
          }

          setModalAction({
            isForbidden: true,
          });
        })
        .catch((e) => {
          toast(e, "error");
          onModalClose();
        })
        .finally(() => {
          setLoadingMessage("");
          setIsLoading(false);
        });
    }
  };

  React.useEffect(() => {
    loadData();
  }, [isCorrectNetwork]);

  const releaseCallbacks: IReleaseTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true);
      setLoadingMessage("Connecting");
      props.callbacks &&
        props.callbacks.connectingWallet &&
        props.callbacks.connectingWallet();
    },
    connected: () => {
      setLoadingMessage("Connected");
      props.callbacks &&
        props.callbacks.connected &&
        props.callbacks.connected();
    },
    broadcasting: () => {
      setLoadingMessage("Waiting for approval");
      props.callbacks &&
        props.callbacks.broadcasting &&
        props.callbacks.broadcasting();
    },
    broadcasted: (payload: IReleasedTransactionPayload) => {
      props.callbacks &&
        props.callbacks.broadcasted &&
        props.callbacks.broadcasted(payload);
      setLoadingMessage("Waiting confirmation");
    },
    confirmed: (payload: IReleasedTransactionPayload) => {
      props.callbacks &&
        props.callbacks.confirmed &&
        props.callbacks.confirmed(payload);

      toast("Released", "success");
      setPaymentStatus(EscrowStatus.RELEASED);
      setSuccess(payload);
      setIsLoading(false);
    },
  };

  const onRelease = () => {
    release(props.escrowId, releaseCallbacks).catch((e) => {
      setIsLoading(false);
      toast(e, "error");
    });
  };

  const ModalBody = () => {
    if (!escrowData) {
      return null;
    }

    if (!(isLoading || modalAction.isForbidden)) {
      return (
        <Forbidden onClose={onModalClose} description={modalAction.reason} />
      );
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
            copy={escrowData.seller}
            label="Seller"
            value={addressWithYou(escrowData.seller, escrowData.walletAddress)}
            marker={MARKER.seller}
          />
          <DataDisplayer
            copy={escrowData.buyer}
            label="Buyer"
            value={addressWithYou(escrowData.buyer, escrowData.walletAddress)}
            marker={MARKER.buyer}
          />

          <DataDisplayer label={labelChallengePeriod} value={countdown} />
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
        </ContainerDataDisplayer>
      </>
    );
  };

  const ModalFooter = () => {
    if (!escrowData) {
      return null;
    }

    if (!(isLoading || modalAction.isForbidden)) {
      return null;
    }

    let buttonChildren;
    let buttonOnClick;

    if (!(error || success)) {
      buttonChildren = "Confirm Release";
      buttonOnClick = onRelease;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onRelease;
    }

    return (
      <Button fullWidth disabled={isLoading} onClick={buttonOnClick}>
        {buttonChildren}
      </Button>
    );
  };

  return (
    <div ref={closeHandlerRef}>
      <ScopedModal
        title={"Release Payment"}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </div>
  );
}
