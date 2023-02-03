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
import { MARKER } from "../../../config/marker";
import { addressWithYou, reduceAddress, displayableAmount } from "helpers";
import { useCountdownChallengePeriod } from "../hooks/useCountdownChallengePeriod";
import { ModalAction } from "../components/Modal";
import { useAsync } from "../hooks/useAsync";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

export function ReleaseModal(props: IReleaseModalProps) {
  const { success, setSuccess, setIsLoading, setLoadingMessage, onModalClose } =
    useModalStates({ deferredPromise: props.deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);

  const [paymentStatus, setPaymentStatus] = React.useState<string>();
  const [modalAction, setModalAction] = React.useState<ModalAction>();

  const [escrowData, isLoading, error] = useAsync(
    props.escrowId,
    getEscrowData,
    onModalClose,
  );

  const { labelChallengePeriod, countdown } =
    useCountdownChallengePeriod(escrowData);

  React.useEffect(() => {
    if (escrowData) {
      if (escrowData.connectedUser !== "buyer") {
        setModalAction({
          isForbidden: false,
          reason: "Only the buyer can release the payment",
        });
        return;
      }

      if (escrowData.status.claimed) {
        setModalAction({
          isForbidden: false,
          reason: "The payment is already claimed",
        });
        return;
      }

      setPaymentStatus(escrowData.status.state);

      if (escrowData.status.state === EscrowStatus.CHALLENGED) {
        setPaymentStatus(
          `${EscrowStatus.CHALLENGED} by ${escrowData.status.latestChallengeBy}`,
        );
      }

      setModalAction({
        isForbidden: true,
      });
    }
  }, [escrowData]);

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
      setSuccess(payload.transactionHash);
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
            value={addressWithYou(
              escrowData.seller,
              escrowData.connectedWallet,
            )}
            marker={MARKER.seller}
          />
          <DataDisplayer
            copy={escrowData.buyer}
            label="Buyer"
            value={addressWithYou(escrowData.buyer, escrowData.connectedWallet)}
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
        loadingMessage={isLoading ? "Getting Escrow information" : ""}
        modalAction={modalAction}
      />
    </div>
  );
}
