import React from "react";
import {
  EscrowStatus,
  IBalanceWithTokenInfo,
  IClaimTransactionCallbacks,
  IClaimTransactionPayload,
  ISingleClaimModalProps,
} from "../../../typing";
import { useModalStates } from "../../ui/hooks";
import { toast } from "../notification/toast";

import { ScopedModal, TokenSymbol, Table, Button } from "../components";
import { Forbidden } from "../components/Forbidden";
import { getSingleBalance, claim } from "../../../core";
import {
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../../helpers";
import { isCorrectNetworkConnected, switchNetwork } from "wallet";
import { DefaultNetwork } from "config/setup";
import { IncorrectNetwork } from "ui/internal/components/IncorrectNetwork";

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
          _escrowBalance.token.symbol!,
        ]);

        const exchangeValue = exchangeValues[_escrowBalance.token.symbol!];

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
    const decimals = displayDecimals(escrowBalance.token.symbol!);

    return (
      <tr>
        <td>
          {amount.toFixed(decimals)} <TokenSymbol>{decimals}</TokenSymbol>
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

  const onSingleClaim = () => {
    claim(props.escrowId, claimCallbacks).catch((e) => {
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
