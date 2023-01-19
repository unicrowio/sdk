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
import { useNetworkCheck } from "../hooks/useNetworkCheck";

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

  const { isCorrectNetwork } = useNetworkCheck();

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

  const TableRow = (balance: IBalanceWithTokenUSD) => {
    const [rowTokenInfo, setRowTokenInfo] = React.useState<IToken>();
    const [tokenInfoLoading, setTokenInfoLoading] =
      React.useState<boolean>(false);
    const [amountInUSD, setAmountInUSD] = React.useState<string>(balance.amountInUSD);

    React.useEffect(() => {
      if (isCorrectNetwork) {
        setTokenInfoLoading(true);
        getTokenInfo(balance.token.address)
          .then(setRowTokenInfo)
          .finally(() => {
            setTokenInfoLoading(false);
          });

        getExchangeRates([balance.token.symbol]).then((exchangeValues) => {
          const symbol = balance.token.symbol as string;
          const exchangeValue = exchangeValues[symbol];

          if (exchangeValue) {
            setAmountInUSD(formatAmountToUSD(
              balance.amountBN,
              exchangeValue,
            ))
          } else {
            setAmountInUSD("n/a (error)");
          }
        });
      }
    }, [isCorrectNetwork]);

    return (
      <tr key={`balance-${balance.token.address}`}>
        {!tokenInfoLoading && rowTokenInfo ? (
          <>
            <td>
              {balance.amountBN
                .toNumber()
                .toFixed(displayDecimals(balance.token.symbol!))}{" "}
              <TokenSymbol>{rowTokenInfo.symbol}</TokenSymbol>
            </td>
            <td>
              {"$"}
              {amountInUSD}
            </td>
          </>
        ) : (
          <td>
            {tokenInfoLoading && "Loading..."}
            {!rowTokenInfo && "Error while loading Token Info"}
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
            TableRow(balance),
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
