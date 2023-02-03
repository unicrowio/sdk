import React from "react";
import {
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  IClaimModalProps,
  IBalanceWithTokenInfo,
} from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { Button, Table, ScopedModal } from "../components";
import { toast } from "../notification/toast";
import { Forbidden } from "../components/Forbidden";
import { getSingleBalance, claim } from "../../../core";
import { ModalAction } from "../components/Modal";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { useAsync } from "../hooks/useAsync";
import { TableRow } from "../components/TableRow";

interface IBalanceWithTokenUSD extends IBalanceWithTokenInfo {
  amountInUSD?: string;
}

export function ClaimModal(props: IClaimModalProps) {
  const { success, setSuccess, setIsLoading, setLoadingMessage, onModalClose } =
    useModalStates({ deferredPromise: props.deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);

  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const [escrowBalance, isLoading, error] = useAsync(
    props.escrowId,
    getSingleBalance,
    onModalClose,
  );

  React.useEffect(() => {
    if (escrowBalance?.connectedUser === "other") {
      setModalAction({
        isForbidden: true,
      });
    }

    if (escrowBalance?.status !== "Ready to claim") {
      setModalAction({
        isForbidden: true,
        reason: "You cannot claim this payment at this time",
      });
    }
  }, [escrowBalance]);

  const claimCallbacks: IClaimTransactionCallbacks = {
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

      toast("Claimed", "success");

      setSuccess(payload.transactionHash);
      setIsLoading(false);
    },
  };

  const onClaim = () => {
    claim(Number(props.escrowId), claimCallbacks).catch((e) => {
      setIsLoading(false);
      toast(e, "error");
    });
  };

  const ModalBody = () => {
    if (!escrowBalance) {
      return null;
    }

    if (modalAction?.isForbidden) {
      return (
        <Forbidden onClose={onModalClose} description={modalAction.reason} />
      );
    }
    return (
      <Table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>
          {[escrowBalance].map((balance: IBalanceWithTokenUSD) =>
            TableRow(balance, onModalClose, setIsLoading),
          )}
        </tbody>
      </Table>
    );
  };

  const ModalFooter = () => {
    if (!escrowBalance || modalAction?.isForbidden) {
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
      <Button fullWidth disabled={isLoading} onClick={buttonOnClick}>
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
        isLoading={isLoading}
        loadingMessage={isLoading ? "Getting Escrow information" : ""}
      />
    </div>
  );
}
