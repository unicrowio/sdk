import React from "react";
import {
  EscrowStatus,
  IBalanceWithTokenInfo,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  ISingleClaimModalProps,
} from "../../typing";
import { useModalStates } from "../../ui/hooks";
import { toast } from "../components/notification/toast";

import { ScopedModal, Symbol, Table, Button } from "../components";
import { Forbidden } from "../components/Forbidden";
import { getSingleBalance, singleClaim } from "../../core";
import {
  displayableAmountBN,
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../helpers";
import { isCorrectNetworkConnected, switchNetwork } from "wallet";
import { DefaultNetwork } from "config/setup";
import { IncorrectNetwork } from "ui/components/IncorrectNetwork";

type IBalanceWithTokenUSD = IBalanceWithTokenInfo & {
  amountInUSD?: string;
};

type IProtectedActions = {
  canDoClaim: boolean;
  reason?: string;
};

export function SingleClaimModal(props: ISingleClaimModalProps) {
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

  const [protect, setProtect] = React.useState<IProtectedActions>(
    {} as IProtectedActions,
  );

  const [escrowBalance, setEscrowBalance] =
    React.useState<IBalanceWithTokenUSD>();

  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<boolean>(true);

  const getBalance = async () => {
    try {
      const isCorrect = await isCorrectNetworkConnected();
      setIsCorrectNetwork(isCorrect);
      if (isCorrect) {
        setIsLoading(true);
        setLoadingMessage("Getting Escrow information");
        const _escrowBalance: IBalanceWithTokenUSD = await getSingleBalance(
          props.escrowId,
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
    if (isLoading || !escrowBalance) {
      return (
        <tr>
          <td>Loading...</td>
        </tr>
      );
    }

    const amount = Number(escrowBalance.displayableAmount);
    const decimals = displayDecimals(escrowBalance.tokenSymbol!);

    return (
      <tr>
        <td>
          {amount.toFixed(decimals)} <Symbol>{decimals}</Symbol>
        </td>
        <td>
          {"$"}
          {escrowBalance.amountInUSD}
        </td>
      </tr>
    );
  }, [escrowBalance, isLoading]);

  const claimCallbacks: IClaimTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true);
      setLoadingMessage("Connecting");
      props.callbacks.connectingWallet?.();
    },
    connected: () => {
      setLoadingMessage("Connected");
      props.callbacks.connected?.();
    },
    broadcasting: () => {
      setLoadingMessage("Waiting for approval");
      props.callbacks.broadcasting?.();
    },
    broadcasted: (payload: IClaimTransactionPayload) => {
      props.callbacks.broadcasted?.(payload);
      setLoadingMessage("Waiting confirmation");
    },
    confirmed: (payload: IClaimTransactionPayload) => {
      props.callbacks.confirmed?.(payload);

      toast("Claimed", "success");

      setSuccess(payload.transactionHash);
      setIsLoading(false);
    },
  };

  const onSingleClaim = () => {
    singleClaim(props.escrowId, claimCallbacks).catch((e) => {
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
      !(isCorrectNetwork && escrowBalance && (isLoading || protect.canDoClaim))
    ) {
      return null;
    }

    let buttonChildren;
    let buttonOnClick;

    if (!(error || success)) {
      buttonChildren = "Confirm";
      buttonOnClick = onSingleClaim;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onSingleClaim;
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
