import React from "react";
import { getTokenInfo } from "../../core/getTokenInfo";
import {
  EscrowStatus,
  IPaymentModalProps,
  IPayTransactionCallbacks,
  IPayTransactionPayload,
  ITokenInfo,
} from "../../typing";
import { pay } from "../../core/pay";
import { Subtitle, ScopedModal, Amount, Button } from "../../ui/components";
import {
  DataDisplayer,
  ContainerDataDisplayer,
} from "../../ui/components/DataDisplayer";
import { useModalStates } from "../../ui/hooks/useModalStates";
import { displayChallengePeriod } from "../../helpers/displayChallengePeriod";

import { addressWithYou, reduceAddress } from "../../helpers/addressFormat";
import { toast } from "../components/notification/toast";
import {
  getWalletAccount,
  isCorrectNetworkConnected,
  startListeningNetwork,
  switchNetwork,
} from "../../wallet";
import { ADDRESS_ZERO } from "../../helpers/constants";
import { formatAmount } from "../../helpers/formatAmount";
import { MARKER } from "../../config/marker";
import { IncorrectNetwork } from "ui/components/IncorrectNetwork";
import { DefaultNetwork } from "config/setup";
import { AddressesToCheck } from "helpers/validateParameters";

export function PayModal(props: IPaymentModalProps) {
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

  const [modalTitle, setModalTitle] = React.useState("Payment");
  const [paymentStatus, setPaymentStatus] = React.useState<EscrowStatus>(
    EscrowStatus.UNPAID,
  );
  const [tokenInfo, setTokenInfo] = React.useState<ITokenInfo>();
  const [buyer, setBuyer] = React.useState<string | null>();

  const [walletUser, setWalletUser] = React.useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<boolean>(true);

  React.useEffect(() => {
    setIsLoading(true);

    startListeningNetwork((network) => {
      setIsCorrectNetwork(network === globalThis.defaultNetwork.chainId);
    });

    isCorrectNetworkConnected().then((isCorrect) => {
      setIsCorrectNetwork(isCorrect);
    });

    getWalletAccount().then((account) => {
      setWalletUser(account);
    });
    getTokenInfo(props.paymentProps.tokenAddress)
      .then(setTokenInfo)
      .catch(() => {
        onModalClose();
      })
      .finally(() => {
        setIsLoading(false);
        setLoadingMessage("");
      });
  }, []);

  const payCallbacks: IPayTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true);
      setLoadingMessage("Connecting");
      props.callbacks &&
        props.callbacks.connectingWallet &&
        props.callbacks.connectingWallet();
    },
    connected: () => {
      setLoadingMessage("Connected");
      props.callbacks && callbacks.connected && callbacks.connected();
    },
    broadcasting: () => {
      setLoadingMessage("Waiting for approval");
      props.callbacks &&
        props.callbacks.broadcasting &&
        props.callbacks.broadcasting();
    },
    broadcasted: (payload: IPayTransactionPayload) => {
      props.callbacks &&
        props.callbacks.broadcasted &&
        props.callbacks.broadcasted(payload);
      setLoadingMessage("Waiting confirmation");
    },
    confirmed: (payload: IPayTransactionPayload) => {
      props.callbacks &&
        props.callbacks.confirmed &&
        props.callbacks.confirmed(payload);

      toast("Payment Sent", "success");
      setModalTitle("Payment Sent");

      setBuyer(payload.buyer);
      setPaymentStatus(EscrowStatus.PAID);

      setSuccess(payload.transactionHash);

      setIsLoading(false);
    },
  };

  const onPayClick = () => {
    pay(props.paymentProps, payCallbacks).catch((e) => {
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

    return (
      <>
        <Amount
          amount={formatAmount(
            props.paymentProps.amount,
            tokenInfo?.decimals || 18,
            tokenInfo?.symbol || "ERR",
          )}
          tokenSymbol={tokenInfo?.symbol ? tokenInfo.symbol : "ERR"}
          status={paymentStatus}
        />
        <Subtitle>Payment Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            label="Seller ETH Address"
            value={addressWithYou(
              props.paymentProps.seller,
              walletUser!,
              props.paymentProps.ensAddresses.seller,
            )}
            copy={props.paymentProps.seller}
            marker={MARKER.seller}
          />
          {buyer && (
            <DataDisplayer
              label="Buyer"
              value={addressWithYou(buyer, walletUser!)}
              copy={buyer}
              marker={MARKER.buyer}
            />
          )}
          <DataDisplayer
            label="Challenge Period"
            value={displayChallengePeriod(props.paymentProps.challengePeriod)}
            marker={MARKER.challengePeriod}
          />
          {props.paymentProps.challengePeriodExtension && (
            <DataDisplayer
              label="Challenge Period Extension"
              value={displayChallengePeriod(
                props.paymentProps.challengePeriodExtension,
              )}
              marker={MARKER.challengePeriodExtension}
            />
          )}
          {props.paymentProps.arbitrator && (
            <>
              <DataDisplayer
                label="Arbitrator"
                value={reduceAddress(
                  props.paymentProps.arbitrator,
                  props.paymentProps.ensAddresses.arbitrator,
                )}
                copy={props.paymentProps.arbitrator}
                marker={MARKER.arbitrator}
              />
              <DataDisplayer
                label="Arbitrator Fee"
                value={`${
                  props.paymentProps.arbitratorFee?.toString() || "... "
                }%`}
                marker={MARKER.arbitratorFee}
              />
            </>
          )}
          {props.paymentProps.marketplace &&
            props.paymentProps.marketplace?.toLowerCase() !==
              ADDRESS_ZERO.toLowerCase() && (
              <DataDisplayer
                label="Marketplace Address"
                value={reduceAddress(
                  props.paymentProps.marketplace,
                  props.paymentProps.ensAddresses.marketplace,
                )}
                copy={props.paymentProps.marketplace}
                marker={MARKER.marketplace}
              />
            )}
        </ContainerDataDisplayer>
      </>
    );
  };

  const ModalFooter = () => {
    if (!isCorrectNetwork) {
      return null;
    }

    let buttonChildren;
    let buttonOnClick;

    if (!(error || success)) {
      buttonChildren = `Pay ${props.paymentProps.amount} ${
        tokenInfo ? tokenInfo.symbol : "-"
      }`;
      buttonOnClick = onPayClick;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onPayClick;
    }

    return (
      <Button fullWidth disabled={isLoading} onClick={buttonOnClick}>
        {buttonChildren}
      </Button>
    );
  };

  return (
    <ScopedModal
      title={modalTitle}
      body={<ModalBody />}
      footer={<ModalFooter />}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  );
}
