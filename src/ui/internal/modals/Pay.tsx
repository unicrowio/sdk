import React from "react";
import { getTokenInfo } from "../../../core/getTokenInfo";
import {
  EscrowStatus,
  IPaymentModalProps,
  IPayTransactionCallbacks,
  IPayTransactionPayload,
  IToken,
} from "../../../typing";
import { pay } from "../../../core/pay";
import {
  Subtitle,
  ScopedModal,
  Amount,
  Button,
  DataDisplayer,
} from "../../../ui/internal/components";

import { useModalStates } from "../../../ui/internal/hooks/useModalStates";
import {
  displayChallengePeriod,
  addressWithYou,
  reduceAddress,
  ADDRESS_ZERO,
  formatAmount,
} from "../../../helpers";
import { ContainerDataDisplayer } from "ui/internal/components/DataDisplayer";
import { toast } from "../notification/toast";
import { getWalletAccount } from "../../../wallet";
import { MARKER } from "../../../config/marker";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

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

  const { isCorrectNetwork } = useNetworkCheck();
  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [modalTitle, setModalTitle] = React.useState("Payment");
  const [paymentStatus, setPaymentStatus] = React.useState<EscrowStatus>(
    EscrowStatus.UNPAID,
  );
  const [tokenInfo, setTokenInfo] = React.useState<IToken>();
  const [buyer, setBuyer] = React.useState<string | null>();

  const [walletUser, setWalletUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isCorrectNetwork) {
      setIsLoading(true);

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
    }
  }, [isCorrectNetwork]);

  const payCallbacks: IPayTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true);
      setLoadingMessage("Connecting");
      props.callbacks &&
        props.callbacks.connectingWallet &&
        props.callbacks.connectingWallet();
    },
    connected: (address: string) => {
      setLoadingMessage("Connected");
      props.callbacks &&
        props.callbacks.connected &&
        props.callbacks.connected(address);
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

      toast.success("Payment Sent");
      setModalTitle("Payment Sent");

      setBuyer(payload.buyer);
      setPaymentStatus(EscrowStatus.PAID);

      setSuccess(payload);

      setIsLoading(false);
    },
  };

  const onPayClick = () => {
    pay(props.paymentProps, payCallbacks).catch((e) => {
      setIsLoading(false);
      toast.error(e);
    });
  };

  const ModalBody = () => {
    return (
      <>
        <Amount
          amount={formatAmount(
            props.paymentProps.amount,
            tokenInfo?.decimals || 18,
            tokenInfo?.symbol || "",
          )}
          tokenSymbol={tokenInfo?.symbol}
          status={paymentStatus}
        />
        <Subtitle>Payment Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            label="Seller ETH Address"
            value={addressWithYou(
              props.paymentProps.seller,
              walletUser,
              props.paymentProps.ensAddresses?.seller,
            )}
            copy={props.paymentProps.seller}
            marker={MARKER.seller}
          />
          {buyer && (
            <DataDisplayer
              label="Buyer"
              value={addressWithYou(buyer, walletUser)}
              copy={buyer}
              marker={MARKER.buyer}
            />
          )}
          <DataDisplayer
            label="Challenge Period"
            value={displayChallengePeriod(props.paymentProps.challengePeriod)}
            marker={MARKER.challengePeriod}
          />
          {props.paymentProps.challengePeriodExtension > 0 && (
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
                  props.paymentProps.ensAddresses?.arbitrator,
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
                  props.paymentProps.ensAddresses?.marketplace,
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
    <div ref={closeHandlerRef}>
      <ScopedModal
        title={modalTitle}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </div>
  );
}
