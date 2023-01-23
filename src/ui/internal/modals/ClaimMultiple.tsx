import React from "react";
import {
  IBalanceWithTokenInfo,
  IClaimMultipleModalProps,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  IToken,
} from "../../../typing";
import { Button, Table, ScopedModal, TokenSymbol } from "../components";
import { useModalStates } from "../hooks/useModalStates";
import { toast } from "../notification/toast";
import { claimMultiple, getTokenInfo } from "../../../core";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../../helpers";
import { useAsync } from "../hooks/useAsync";

interface IBalanceWithTokenUSD extends IBalanceWithTokenInfo {
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

  const onHandleMultipleClaim = () => {
    claimMultiple(props.escrowIds, claimCallbacks).catch((e) => {
      setIsLoading(false);
      toast(e, "error");
    });
  };

  const TableRow = (
    balance: IBalanceWithTokenUSD,
    onModalClose,
    setIsLoading,
  ) => {
    const [rowTokenInfo, isLoadingToken] = useAsync(
      balance.token.address,
      getTokenInfo,
      onModalClose,
    );

    const [exchangeValues, , error] = useAsync(
      [balance.token.symbol],
      getExchangeRates,
      onModalClose,
    );

    const isLoading = isLoadingToken;
    const [formattedAmountInUSD, setFormattedAmountInUSD] =
      React.useState("...");

    React.useEffect(() => {
      if (exchangeValues) {
        const exchangeValue = exchangeValues[balance.token.symbol];

        setFormattedAmountInUSD(
          formatAmountToUSD(balance.amountBN, exchangeValue),
        );
      }
    }, [exchangeValues]);

    React.useEffect(() => {
      if (error) {
        setFormattedAmountInUSD("n/a (error)");
      }
    }, [error]);

    React.useEffect(() => {
      setIsLoading(isLoading);
    }, [isLoading]);

    return (
      <tr key={`balance-${balance.token.address}`}>
        {!isLoading && rowTokenInfo !== undefined ? (
          <>
            <td>
              {balance.amountBN
                .toNumber()
                .toFixed(displayDecimals(balance.token.symbol!))}{" "}
              <TokenSymbol>{rowTokenInfo.symbol}</TokenSymbol>
            </td>
            <td>
              {"$"}
              {formattedAmountInUSD}
            </td>
          </>
        ) : (
          <td>
            {isLoading && "Loading..."}
            {!isLoading &&
              rowTokenInfo === null &&
              "Error while loading Token Info"}
          </td>
        )}
      </tr>
    );
  };

  const ModalBody = () => {
    return (
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
  );
}
