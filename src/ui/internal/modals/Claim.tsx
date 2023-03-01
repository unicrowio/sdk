import React from "react";
import {
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  IClaimModalProps,
  IBalanceDetailed,
  EscrowStatus,
} from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { Button, ScopedModal } from "../components";
import { toast } from "../notification/toast";
import { getSingleBalance, claim } from "../../../core";
import { ModalAction } from "../components/Modal";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { stopAsync, useAsync } from "../hooks/useAsync";
import { BalancesTable } from "../components/BalancesTable";

export function ClaimModal(props: IClaimModalProps) {
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose,
  } = useModalStates({ deferredPromise: props.deferredPromise });

  const [escrowBalance, isLoadingBalance, error] = useAsync(
    props.escrowId,
    getSingleBalance,
    onModalClose,
    null,
  );

  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [isLoadingTable, setLoadingTable] = React.useState(false);
  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const isLoadingAnything = isLoadingBalance || isLoadingTable || isLoading;

  React.useEffect(() => {
    if (escrowBalance && !success) {
      if (escrowBalance.connectedUser === "other") {
        setModalAction({
          isForbidden: true,
        });
      } else if (escrowBalance.status.state !== EscrowStatus.PERIOD_EXPIRED) {
        setModalAction({
          isForbidden: true,
          reason:
            "The escrow has been challenged and its period has not expired yet",
        });
      } else if (escrowBalance.status.claimed) {
        setModalAction({
          isForbidden: true,
          reason: "This escrow has already been claimed",
        });
      }
    }
  }, [escrowBalance, success]);

  const claimCallbacks: IClaimTransactionCallbacks = {
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
    broadcasted: (payload: IClaimTransactionPayload) => {
      props.callbacks &&
        props.callbacks.broadcasted &&
        props.callbacks.broadcasted(payload);
      setLoadingMessage("Waiting for confirmation");
      stopAsync();
    },
    confirmed: (payload: IClaimTransactionPayload) => {
      props.callbacks &&
        props.callbacks.confirmed &&
        props.callbacks.confirmed(payload);

      toast.success("Claimed");
      setSuccess(payload);
      setIsLoading(false);
    },
  };

  const onClaim = () => {
    claim(Number(props.escrowId), claimCallbacks).catch((e) => {
      setIsLoading(false);
      toast.error(e);
    });
  };

  const ModalBody = () => {
    if (!escrowBalance && !success) {
      return null;
    }

    return (
      <BalancesTable
        balances={[escrowBalance]}
        onModalClose={onModalClose}
        setIsLoading={setLoadingTable}
        success={success}
      />
    );
  };

  const ModalFooter = () => {
    if (!escrowBalance && !success) {
      return null;
    }

    let buttonChildren;
    let buttonOnClick;

    if (!(error || success)) {
      buttonChildren = "Confirm";
      buttonOnClick = onClaim;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onClaim;
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
        title="Claim Payment"
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
