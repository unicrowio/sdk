import React from "react";
import {
  EscrowStatus,
  IPaymentModalProps,
  IPayTransactionCallbacks,
  IPayTransactionPayload,
  IEnsAddresses,
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
  validateParameters,
} from "../../../helpers";
import { ContainerDataDisplayer } from "ui/internal/components/DataDisplayer";
import { toast } from "../notification/toast";
import { isWeb3WalletConnected } from "../../../wallet";
import { MARKER } from "../../../config/marker";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { useTokenInfo } from "ui/internal/hooks/useTokenInfo";
import { useWallet } from "../hooks/useWallet";
import { useNetworkCheck } from "../hooks/useNetworkCheck";

//TODO: move this somewhere to utils
function formatAmount(amount: string, maxDecimals: number): string {
  const num = parseFloat(amount);
  if (Number.isInteger(num)) {
    // No decimals if the number is an integer
    return num.toString();
  } else {
    // Determine the actual number of decimal places
    const actualDecimals = (amount.split(".")[1] || "").length;
    // Use the smaller of actualDecimals and maxDecimals
    const decimalPlaces = Math.min(actualDecimals, maxDecimals);
    return num.toFixed(decimalPlaces);
  }
}

export function PayModal(props: IPaymentModalProps) {
  const {
    success,
    setSuccess,
    setIsLoading,
    isLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose,
  } = useModalStates({ deferredPromise: props.deferredPromise });

  const { isCorrectNetwork } = useNetworkCheck();
  const { walletUser, isLoadingWallet, isErrorWallet } = useWallet();

  const {
    data: tokenInfo,
    isLoading: isLoadingToken,
    error: errorToken,
  } = useTokenInfo(props.paymentProps.tokenAddress);

  const closeHandlerRef = useModalCloseHandler(
    props.paymentProps?.cancelUrl ? () => {} : onModalClose,
  );
  const [modalTitle, setModalTitle] = React.useState("Payment");
  const [paymentStatus, setPaymentStatus] = React.useState<EscrowStatus>(
    EscrowStatus.UNPAID,
  );
  const [buyer, setBuyer] = React.useState<string | null>();
  const [callbackCountdown, setCallbackCountdown] = React.useState<number>(10);
  const [startCountdown, setStartCountdown] = React.useState<boolean>(false);
  const [ensAddresses, setEnsAddresses] = React.useState<IEnsAddresses>(null);
  const isLoadingAnything =
    isCorrectNetwork && (isLoadingToken || isLoadingWallet || isLoading);
  const error = isErrorWallet || errorToken;

  React.useEffect(() => {
    const validate = async () => {
      if (!isErrorWallet && isWeb3WalletConnected) {
        const { addresses } = await validateParameters({
          ...props.paymentProps,
          buyer: walletUser || "",
        });

        Object.entries(addresses.common).forEach(([key, value]) => {
          props.paymentProps[key] = value;
        });

        setEnsAddresses(addresses.ens);
      }
    };

    validate();
  }, [walletUser, isLoadingWallet, isErrorWallet]);

  React.useEffect(() => {
    let interval;

    if (startCountdown) {
      if (callbackCountdown > 0) {
        interval = setInterval(() => {
          setCallbackCountdown((currentCount) => Math.max(currentCount - 1, 0));
        }, 1000);
      } else {
        window.location.href = props.paymentProps.callbackUrl;
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startCountdown, callbackCountdown]);

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
      setLoadingMessage("Waiting for confirmation");
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

  const onPayClick = async () => {
    setIsLoading(true);
    await pay(props.paymentProps, payCallbacks).catch((e) => {
      toast.error(e);
    });
    setIsLoading(false);
  };

  const ModalBody = () => {
    return (
      <>
        <Amount
          amount={formatAmount(props.paymentProps.amount.toString(), 4)}
          precision={tokenInfo?.decimals}
          tokenAddress={props.paymentProps.tokenAddress}
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
              ensAddresses?.seller,
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
            value={displayChallengePeriod(
              props.paymentProps.challengePeriod,
              true,
            )}
            marker={MARKER.challengePeriod}
          />
          {props.paymentProps.challengePeriodExtension > 0 && (
            <DataDisplayer
              label="Challenge Period Extension"
              value={displayChallengePeriod(
                props.paymentProps.challengePeriodExtension,
                true,
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
                  ensAddresses?.arbitrator,
                )}
                copy={props.paymentProps.arbitrator}
                marker={MARKER.arbitrator}
              />
              <DataDisplayer
                label="Arbitrator Fee"
                value={`${
                  props.paymentProps.arbitratorFee?.toString() || "0 "
                }%`}
                marker={MARKER.arbitratorFee}
              />
            </>
          )}
          {props.paymentProps.reference ? (
            <DataDisplayer
              label="Reference"
              value={props.paymentProps.reference}
              copy={props.paymentProps.reference}
              marker={MARKER.reference}
            />
          ) : (
            <></>
          )}
        </ContainerDataDisplayer>
      </>
    );
  };

  const ModalFooter = () => {
    let buttonChildren;
    let buttonOnClick;
    let buttonCallback = <></>;

    if (props.paymentProps?.cancelUrl) {
      buttonCallback = (
        <Button
          fullWidth
          variant="tertiary"
          style={{ marginTop: 15 }}
          disabled={isLoadingAnything}
          onClick={() => (window.location.href = props.paymentProps?.cancelUrl)}
        >
          Cancel
        </Button>
      );
    }

    if (!(error || success)) {
      buttonChildren = `Pay ${formatAmount(
        props.paymentProps.amount.toString(),
        4,
      )} ${tokenInfo ? tokenInfo.symbol : "ETH"}`;
      buttonOnClick = onPayClick;
    } else if (success) {
      buttonChildren = "Close";
      if (props.paymentProps?.callbackUrl) {
        setStartCountdown(true);
        buttonChildren = `Back to merchant in ... ${callbackCountdown}s`;
        buttonCallback = <></>;
        buttonOnClick = () =>
          (window.location.href = props.paymentProps.callbackUrl);
      } else {
        buttonOnClick = onModalClose;
      }
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onPayClick;
    }

    return (
      <>
        <Button fullWidth disabled={isLoadingAnything} onClick={buttonOnClick}>
          {buttonChildren}
        </Button>
        {buttonCallback}
      </>
    );
  };

  return (
    <div ref={closeHandlerRef}>
      <ScopedModal
        title={modalTitle}
        body={<ModalBody />}
        footer={<ModalFooter />}
        closeable={props.paymentProps?.cancelUrl ? false : true}
        onClose={onModalClose}
        isLoading={isLoadingAnything}
        loadingMessage={loadingMessage}
      />
    </div>
  );
}
