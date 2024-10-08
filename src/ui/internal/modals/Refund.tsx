import {
  EscrowStatus,
  IRefundModalProps,
  IRefundTransactionCallbacks,
  IRefundTransactionPayload,
} from "../../../typing";
import React from "react";
import {
  Subtitle,
  Amount,
  Button,
  ScopedModal,
  DataDisplayer,
} from "../../../ui/internal/components";
import {
  reduceAddress,
  formatAmount,
  SELLER,
  addressWithYou,
} from "../../../helpers";
import { toast } from "../notification/toast";
import { refund } from "../../../core";
import { MARKER } from "../../../config/marker";
import { useModalStates } from "ui/internal/hooks/useModalStates";
import { ContainerDataDisplayer } from "ui/internal/components/DataDisplayer";
import { useCountdownChallengePeriod } from "ui/internal/hooks/useCountdownChallengePeriod";
import { ModalAction } from "../components/Modal";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { useEscrowData } from "ui/internal/hooks/useEscrowData";

export function RefundModal(props: IRefundModalProps) {
  const {
    success,
    setSuccess,
    setIsLoading,
    isLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose,
  } = useModalStates({ deferredPromise: props.deferredPromise });

  const {
    data: escrowData,
    isLoading: isLoadingEscrow,
    error,
  } = useEscrowData({ escrowId: props.escrowId });

  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const [paymentStatus, setPaymentStatus] = React.useState<string>();
  const isLoadingAnything = isLoadingEscrow || isLoading;
  const { labelChallengePeriod, countdown } =
    useCountdownChallengePeriod(escrowData);

  React.useEffect(() => {
    if (escrowData) {
      if (escrowData.connectedUser !== SELLER) {
        setModalAction({
          isForbidden: true,
          reason: "Only the seller can refund the payment",
        });
      } else if (escrowData.status.claimed) {
        setModalAction({
          isForbidden: true,
          reason: "The payment cannot be refunded via Unicrow anymore",
        });
      } else if (escrowData.status.state === EscrowStatus.CHALLENGED) {
        setPaymentStatus(
          `${EscrowStatus.CHALLENGED} by ${escrowData?.status.latestChallengeBy}`,
        );
      }

      setPaymentStatus(escrowData.status.state);
    }
  }, [escrowData]);

  const refundCallbacks: IRefundTransactionCallbacks = {
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
    broadcasted: (payload: IRefundTransactionPayload) => {
      props.callbacks &&
        props.callbacks.broadcasted &&
        props.callbacks.broadcasted(payload);
      setLoadingMessage("Waiting for confirmation");
    },
    confirmed: (payload: IRefundTransactionPayload) => {
      props.callbacks &&
        props.callbacks.confirmed &&
        props.callbacks.confirmed(payload);

      toast.success("Refunded");
      setPaymentStatus(EscrowStatus.REFUNDED);

      setSuccess(payload);
      setIsLoading(false);
    },
  };

  const onRefund = () => {
    refund(props.escrowId, refundCallbacks).catch((e) => {
      setIsLoading(false);
      toast.error(e);
    });
  };

  const ModalBody = () => {
    if (!escrowData) {
      return null;
    }

    const isExpired = escrowData.challengePeriodEnd.getTime() <= Date.now();
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

          {!isExpired && (
            <DataDisplayer
              label={labelChallengePeriod}
              value={countdown}
              marker={MARKER.challengePeriod}
            />
          )}
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
          {escrowData.paymentReference ? (
            <DataDisplayer
              label="Reference"
              value={escrowData.paymentReference}
              copy={escrowData.paymentReference}
              marker={MARKER.paymentReference}
            />
          ) : (
            <></>
          )}
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
      buttonChildren = "Confirm Refund";
      buttonOnClick = onRefund;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onRefund;
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
        title={"Refund Payment"}
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
