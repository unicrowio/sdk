import type * as CSS from "csstype";
import React from "react";
import {
  IBalanceDetailed,
  IClaimMultipleModalProps,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
} from "../../../typing";
import { BigCheckIcon } from "../assets/BigCheckIcon";
import { Button, ScopedModal, Table } from "../components";
import { TableRow } from "../components/TableRow";
import { useModalStates } from "../hooks/useModalStates";
import { toast } from "../notification/toast";
import { claimMultiple } from "../../../core";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

interface IBalanceWithTokenUSD extends IBalanceDetailed {
  amountInUSD?: string;
}

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
      setLoadingMessage("Waiting confirmation");
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
      toast(e, "error");
    });
  };

  React.useEffect(() => {
    setIsLoading(true);
  }, []);

  const ClaimSuccessful = () => {
    const wrapperStyles: CSS.Properties = {
      margin: "0 auto",
      textAlign: "center",
      fontWeight: 500,
    };
    return (
      <div style={wrapperStyles}>
        <BigCheckIcon />
        <p>All balances claimed!</p>
      </div>
    );
  };

  const ModalBody = () => {
    return success ? (
      <ClaimSuccessful />
    ) : (
      <Table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>
          {props.balances.readyForClaim.map((balance: IBalanceWithTokenUSD) =>
            TableRow(balance, onModalClose, setIsLoading),
          )}
        </tbody>
      </Table>
    );
  };

  console.log("pwe", "props.balances", props.balances);

  const ModalFooter = () => {
    let buttonChildren;
    let buttonOnClick;

    if (!(error || success)) {
      buttonChildren = "Confirm";
      buttonOnClick = onHandleMultipleClaim;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onHandleMultipleClaim;
    }

    return (
      <Button
        fullWidth
        disabled={isLoading || props.balances.readyForClaim.length === 0}
        onClick={buttonOnClick}
      >
        {buttonChildren}
      </Button>
    );
  };

  return (
    <div ref={closeHandlerRef}>
      <ScopedModal
        title={
          props.balances.readyForClaim.length > 1
            ? "Claim Balances"
            : "Claim Payment"
        }
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </div>
  );
}
