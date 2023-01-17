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
  displayDecimals,
  formatAmountToUSD,
  getExchangeRates,
} from "../../helpers";
import { useNetworkCheck } from "./../hooks/useNetworkCheck";

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

  const { isCorrectNetwork, BodyWithNetworkCheck, FooterWithNetworkCheck } =
    useNetworkCheck();

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
    singleClaim(props.escrowId, claimCallbacks).catch((e) => {
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

    return BodyWithNetworkCheck(
      <Table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>{renderClaimableBalance()}</tbody>
      </Table>,
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
      buttonOnClick = onSingleClaim;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onSingleClaim;
    }

    return FooterWithNetworkCheck(
      <Button fullWidth disabled={isLoading} onClick={buttonOnClick}>
        {buttonChildren}
      </Button>,
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
