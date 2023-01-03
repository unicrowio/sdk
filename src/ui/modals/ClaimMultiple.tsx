import React from "react";
import {
  IBalanceWithTokenInfo,
  IClaimMultipleModalProps,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  ITokenInfo,
} from "../../typing";
import { Button, Table, ScopedModal, Symbol } from "../components";
import { useModalStates } from "../hooks/useModalStates";
import { toast } from "../components/notification/toast";
import { claimMultiple, getTokenInfo } from "../../core";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../helpers";

type IBalanceWithTokenUSD = IBalanceWithTokenInfo & {
  amountInUSD?: string;
};

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
      props.callbacks.connected?.();
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

  const renderReadyForClaim = React.useCallback(() => {
    return props.balances.readyForClaim.map((balance: IBalanceWithTokenUSD) => {
      const [rowTokenInfo, setRowTokenInfo] = React.useState<ITokenInfo>();
      const [tokenInfoLoading, setTokenInfoLoading] =
        React.useState<boolean>(false);

      React.useEffect(() => {
        setTokenInfoLoading(true);
        getTokenInfo(balance.tokenAddress)
          .then(setRowTokenInfo)
          .finally(() => {
            setTokenInfoLoading(false);
          });

        getExchangeRates([balance.tokenSymbol!]).then((exchangeValues) => {
          const symbol = balance.tokenSymbol as string;
          const exchangeValue = exchangeValues[symbol];

          if (exchangeValue) {
            balance.amountInUSD = formatAmountToUSD(
              balance.amountBN,
              exchangeValue,
            );
          } else {
            balance.amountInUSD = "n/a (error)";
          }
        });
      }, []);

      if (tokenInfoLoading) {
        return (
          <tr key={`balance-${balance.tokenAddress}`}>
            <td>Loading...</td>
          </tr>
        );
      }

      if (!rowTokenInfo) {
        return (
          <tr key={`balance-${balance.tokenSymbol}`}>
            <td>Error while loading Token Info</td>
          </tr>
        );
      }

      return (
        <tr key={`balance-${balance.tokenSymbol}`}>
          <td>
            {balance.amountBN
              .toNumber()
              .toFixed(displayDecimals(balance.tokenSymbol!))}{" "}
            <Symbol>{rowTokenInfo.symbol}</Symbol>
          </td>
          <td>
            {"$"}
            {balance.amountInUSD}
          </td>
        </tr>
      );
    });
  }, [props.balances.readyForClaim]);

  const ModalBody = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>{renderReadyForClaim()}</tbody>
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
