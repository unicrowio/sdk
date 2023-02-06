import React from "react";
import {
  EscrowStatus,
  IBalanceDetailed,
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
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

interface IBalanceWithTokenUSD extends IBalanceDetailed {
  amountInUSD?: string;
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
  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const { isCorrectNetwork } = useNetworkCheck();

  const [modalAction, setModalAction] = React.useState<ModalAction>(
    {} as ModalAction,
  );

  const [escrowBalance, setEscrowBalance] =
    React.useState<IBalanceWithTokenUSD>();

  const getBalance = React.useCallback(async () => {
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

        setModalAction({
          isForbidden: true,
        });

        if (_escrowBalance.connectedUser === "other") {
          setModalAction({
            isForbidden: false,
          });
        }

        if (
          _escrowBalance.statusEscrow.claimed ||
          _escrowBalance.statusEscrow.state !== EscrowStatus.PERIOD_EXPIRED
        ) {
          setModalAction({
            isForbidden: false,
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
  }, [isCorrectNetwork, props.escrowId, onModalClose]);

  React.useEffect(() => {
    if (props.escrowId && !escrowBalance) {
      getBalance();
    }
  }, [isCorrectNetwork, props.escrowId, escrowBalance]);

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

      setSuccess(payload);
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
    <div ref={closeHandlerRef}>
      <ScopedModal
        title="Claim Payment"
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </div>
  );
}
