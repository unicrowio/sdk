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

interface IBalanceWithTokenUSD extends IBalanceWithTokenInfo {
  amountInUSD?: string;
}

interface IProtectedActions {
  canDoClaim: boolean;
  reason?: string;
}

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

  const { isCorrectNetwork } = useNetworkCheck();

  const [protect, setProtect] = React.useState<IProtectedActions>(
    {} as IProtectedActions,
  );

  const [escrowBalance, setEscrowBalance] =
    React.useState<IBalanceWithTokenUSD>();

  const getBalance = async () => {
    if (isCorrectNetwork) {
      try {
        setIsLoading(true);
        setLoadingMessage("Getting Escrow information");

        const _escrowBalance: IBalanceWithTokenUSD = await getSingleBalance(
          Number(props.escrowId),
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
      } catch (error: any) {
        toast(error, "error");
        onModalClose();
      } finally {
        setLoadingMessage("");
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    if (props.escrowId && !escrowBalance) {
      getBalance();
    }
  }, [props.escrowId, escrowBalance]);

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
    if (!(escrowBalance && (isLoading || protect.canDoClaim))) {
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
