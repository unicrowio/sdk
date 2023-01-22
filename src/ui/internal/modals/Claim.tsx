import React from "react";
import {
  EscrowStatus,
  IBalanceWithTokenInfo,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  IClaimModalProps,
} from "../../../typing";
import { useModalStates } from "../hooks/useModalStates";
import { Button, Table, ScopedModal, TokenSymbol } from "../components";
import { toast } from "../notification/toast";
import { Forbidden } from "../components/Forbidden";
import { getSingleBalance, claim } from "../../../core";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../../helpers";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { ModalAction } from "../components/Modal";
import { useAsync } from "../hooks/useAsync";

export function ClaimModal(props: IClaimModalProps) {
  const { success, setSuccess, setIsLoading, setLoadingMessage, onModalClose } =
    useModalStates({ deferredPromise: props.deferredPromise });

  const { isCorrectNetwork } = useNetworkCheck();

  const [modalAction, setModalAction] = React.useState<ModalAction>(
    {} as ModalAction,
  );

  const [escrowBalance, isLoadingBalance] = useAsync(
    getSingleBalance,
    props.escrowId,
    onModalClose,
  );

  const [exchangeValues, isLoadingExchange, error] = useAsync(
    getExchangeRates,
    [escrowBalance?.token.symbol!],
    onModalClose,
  );

  const isLoading = isLoadingBalance || isLoadingExchange;
  const [formattedAmountInUSD, setFormattedAmountInUSD] = React.useState("");

  React.useEffect(() => {
    if (exchangeValues) {
      const exchangeValue = exchangeValues[escrowBalance.token.symbol!];

      if (exchangeValue) {
        setFormattedAmountInUSD(
          formatAmountToUSD(escrowBalance.amountBN, exchangeValue),
        );
      }
    }
  }, [exchangeValues]);

  React.useEffect(() => {
    if (error) {
      setFormattedAmountInUSD("n/a (error)");
    }
  }, [error]);

  React.useEffect(() => {
    if (escrowBalance) {
      setModalAction({
        isForbidden: true,
      });

      if (escrowBalance.connectedUser === "other") {
        setModalAction({
          isForbidden: false,
        });
      }

      if (escrowBalance.status !== "Ready to claim") {
        setModalAction({
          isForbidden: false,
          reason: "You cannot claim this payment at this time",
        });
      }
    }
  }, [escrowBalance]);

  const renderClaimableBalance = React.useCallback(() => {
    if (isCorrectNetwork) {
      if (isLoading || !escrowBalance) {
        return (
          <tr>
            <td>Loading...</td>
          </tr>
        );
      }

      const amount = Number(escrowBalance.displayableAmount);
      const decimals = displayDecimals(escrowBalance.token.symbol!);
      const symbol = escrowBalance.token.symbol || "ERR";

      return (
        <tr>
          <td>
            {amount.toFixed(decimals)} <TokenSymbol>{symbol}</TokenSymbol>
          </td>
          <td>
            {"$"}
            {formattedAmountInUSD}
          </td>
        </tr>
      );
    }
  }, [escrowBalance, isLoading, isCorrectNetwork, formattedAmountInUSD]);

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
    if (!(isLoading || modalAction.isForbidden)) {
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
        <tbody>{renderClaimableBalance()}</tbody>
      </Table>
    );
  };

  const ModalFooter = () => {
    if (!(escrowBalance && (isLoading || modalAction.isForbidden))) {
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
    <ScopedModal
      title="Claim Payment"
      body={<ModalBody />}
      footer={<ModalFooter />}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={isLoading ? "Getting Escrow information" : ""}
    />
  );
}
