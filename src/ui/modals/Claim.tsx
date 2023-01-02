import React, { useEffect } from "react";
import {
  EscrowStatus,
  IBalanceWithTokenInfo,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  IClaimModalProps,
} from "../../typing";
import { useModalStates } from "../hooks";
import { Button, Table, ScopedModal, Symbol } from "../components";
import { toast } from "../components/notification/toast";
import { Forbidden } from "../components/Forbidden";
import { getSingleBalance, claim } from "../../core";
import {
  displayableAmountBN,
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../helpers";
import {
  isCorrectNetworkConnected,
  startListeningNetwork,
  switchNetwork,
} from "wallet";
import { DefaultNetwork } from "config/setup";
import { IncorrectNetwork } from "ui/components/IncorrectNetwork";

type IBalanceWithTokenUSD = IBalanceWithTokenInfo & {
  amountInUSD?: string;
};

type IProtectedActions = {
  canDoClaim: boolean;
  reason?: string;
};

export function ClaimModal(props: IClaimModalProps) {
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

  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<boolean>(true);

  useEffect(() => {
    startListeningNetwork((network) => {
      setIsCorrectNetwork(network === globalThis.defaultNetwork.chainId);
    });

    isCorrectNetworkConnected().then((isCorrect) => {
      setIsCorrectNetwork(isCorrect);
    });
  }, []);

  const [protect, setProtect] = React.useState<IProtectedActions>(
    {} as IProtectedActions,
  );

  const [escrowBalance, setEscrowBalance] =
    React.useState<IBalanceWithTokenUSD>();

  const getBalance = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Getting Escrow information");

      const _escrowBalance: IBalanceWithTokenUSD = await getSingleBalance(
        Number(props.escrowId),
      );

      const exchangeValues = await getExchangeRates([
        _escrowBalance.tokenSymbol!,
      ]);

      const exchangeValue = exchangeValues[_escrowBalance.tokenSymbol!];

      if (exchangeValue) {
        _escrowBalance.amountInUSD = formatAmountToUSD(
          _escrowBalance.amountBN,
          exchangeValue,
        );
      } else {
        _escrowBalance.amountInUSD = "n/a (error)";
      }

      setEscrowBalance(_escrowBalance);

      setProtect({
        canDoClaim: true,
      });

      if (_escrowBalance.connectedUser === "other") {
        setProtect({
          canDoClaim: false,
        });
      }

      if (
        _escrowBalance.statusEscrow.claimed ||
        _escrowBalance.statusEscrow.state !== EscrowStatus.PERIOD_EXPIRED
      ) {
        setProtect({
          canDoClaim: false,
          reason: "You cannot claim this payment at this time",
        });
      }
    } catch (error: any) {
      toast(error, "error");
      onModalClose();
    } finally {
      setLoadingMessage("");
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getBalance();
  }, [props.escrowId]);

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
      const decimals = displayDecimals(escrowBalance.tokenSymbol!);
      const symbol = escrowBalance.tokenSymbol || "ERR";

      return (
        <tr>
          <td>
            {amount.toFixed(decimals)} <Symbol>{symbol}</Symbol>
          </td>
          <td>
            {"$"}
            {escrowBalance.amountInUSD}
          </td>
        </tr>
      );
    }
  }, [escrowBalance, isLoading, isCorrectNetwork]);

  const claimCallbacks: IClaimTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true);
      setLoadingMessage("Connecting");
      props.callbacks && props.callbacks.connectingWallet && props.callbacks.connectingWallet()
    },
    connected: () => {
      setLoadingMessage("Connected");
      props.callbacks.connected?.();
    },
    broadcasting: () => {
      setLoadingMessage("Waiting for approval");
      props.callbacks && props.callbacks.broadcasting && props.callbacks.broadcasting()
    },
    broadcasted: (payload: IClaimTransactionPayload) => {
      props.callbacks && props.callbacks.broadcasted && props.callbacks.broadcasted(payload);
      setLoadingMessage("Waiting confirmation");
    },
    confirmed: (payload: IClaimTransactionPayload) => {
      props.callbacks && props.callbacks.confirmed && props.callbacks.confirmed(payload);

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

  const onNetworkSwitch = async () => {
    await switchNetwork(globalThis.defaultNetwork.name as DefaultNetwork);
    setIsCorrectNetwork(await isCorrectNetworkConnected());
  };

  const ModalBody = () => {
    if (!isCorrectNetwork) {
      return <IncorrectNetwork onClick={onNetworkSwitch} />;
    }

    if (!escrowBalance) {
      return null;
    }
    if (!(isLoading || protect.canDoClaim)) {
      return <Forbidden onClose={onModalClose} description={protect.reason} />;
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
    if (
      !(escrowBalance && isCorrectNetwork && (isLoading || protect.canDoClaim))
    ) {
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
      loadingMessage={loadingMessage}
    />
  );
}
