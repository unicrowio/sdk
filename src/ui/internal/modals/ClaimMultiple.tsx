import type * as CSS from "csstype";
import React from "react";
import {
  IBalanceDetailed,
  IClaimMultipleModalProps,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
} from "../../../typing";
import { Button, ScopedModal, Table } from "../components";
import { BalancesTable } from "../components/BalancesTable";
import { useModalStates } from "../hooks/useModalStates";
import { toast } from "../notification/toast";
import { claimMultiple } from "../../../core";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

export function ClaimMultipleModal(props: IClaimMultipleModalProps) {
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

  const onHandleMultipleClaim = () => {
    claimMultiple(props.escrowIds, claimCallbacks).catch((e) => {
      setIsLoading(false);
      toast.error(e);
    });
  };

  const claimableAmount = props.balances.readyForClaim.length;

  const ModalBody = () => {
    if (isLoading) {
      return null;
    }

    return (
      <BalancesTable
        balances={props.balances.readyForClaim}
        onModalClose={onModalClose}
        setIsLoading={setIsLoading}
        success={success}
      />
    );
  };

  const ModalFooter = () => {
    let buttonChildren;
    let buttonOnClick;

    if (!(error || success) && claimableAmount > 0) {
      buttonChildren = "Confirm";
      buttonOnClick = onHandleMultipleClaim;
    } else if (success || claimableAmount === 0) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onHandleMultipleClaim;
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
        title={claimableAmount > 1 ? "Claim Balances" : "Claim Payment"}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </div>
  );
}
