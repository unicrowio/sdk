import {
  EscrowStatus,
  IGetEscrowData,
  IReleasedTransactionPayload,
  IReleaseModalProps,
  IReleaseTransactionCallbacks,
} from "../../../typing";
import React from "react";
import {
  ContainerDataDisplayer,
  DataDisplayer,
} from "../../../ui/internal/components/DataDisplayer";
import {
  Button,
  Subtitle,
  Amount,
  ScopedModal,
} from "../../../ui/internal/components";
import { useModalStates } from "../../../ui/internal/hooks/useModalStates";
import { toast } from "../notification/toast";
import { release } from "../../../core/release";
import { getEscrowData } from "../../../core/getEscrowData";
import { Forbidden } from "../components/Forbidden";
import { MARKER } from "../../../config/marker";
import { addressWithYou, reduceAddress, displayableAmount } from "helpers";
import {
  isCorrectNetworkConnected,
  startListeningNetwork,
  switchNetwork,
} from "wallet";
import { DefaultNetwork } from "config/setup";
import { IncorrectNetwork } from "ui/internal/components/IncorrectNetwork";

type IProtectedActions = {
  canRelease: boolean;
  reason?: string;
};

export function ReleaseModal(props: IReleaseModalProps) {
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

  const [escrowData, setEscrowData] = React.useState<IGetEscrowData | null>(
    null,
  );

  const [paymentStatus, setPaymentStatus] = React.useState<
    string | undefined
  >();
  const [isCorrectNetwork, setIsCorrectNetwork] = React.useState<boolean>(true);

  const [protect, setProtect] = React.useState<IProtectedActions>(
    {} as IProtectedActions,
  );

  const { labelChallengePeriod, countdown } =
    useCountdownChallengePeriod(escrowData);

  const loadData = async () => {
    const isCorrect = await isCorrectNetworkConnected();
    setIsCorrectNetwork(isCorrect);

    if (isCorrect) {
      setIsLoading(true);
      setLoadingMessage("Getting Escrow information");
      getEscrowData(props.escrowId)
        .then(async (data: IGetEscrowData) => {
          setEscrowData(data);

          if (data.connectedUser !== "buyer") {
            setProtect({
              canRelease: false,
              reason: "Only the buyer can release the payment",
            });
            return;
          }

          if (data.status.claimed) {
            setProtect({
              canRelease: false,
              reason: "The payment is already claimed",
            });
            return;
          }

          setPaymentStatus(data.status.state);

          if (data.status.state === EscrowStatus.CHALLENGED) {
            setPaymentStatus(
              `${EscrowStatus.CHALLENGED} by ${data.status.latestChallengeBy}`,
            );
          }

          setProtect({
            canRelease: true,
          });
        })
        .catch((e) => {
          toast(e, "error");
          onModalClose();
        })
        .finally(() => {
          setLoadingMessage("");
          setIsLoading(false);
        });
    }
  };

  React.useEffect(() => {
    startListeningNetwork((network) => {
      setIsCorrectNetwork(network === globalThis.defaultNetwork.chainId);
    });

    loadData();
  }, []);

  const releaseCallbacks: IReleaseTransactionCallbacks = {
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
    broadcasted: (payload: IReleasedTransactionPayload) => {
      props.callbacks &&
        props.callbacks.broadcasted &&
        props.callbacks.broadcasted(payload);
      setLoadingMessage("Waiting confirmation");
    },
    confirmed: (payload: IReleasedTransactionPayload) => {
      props.callbacks &&
        props.callbacks.confirmed &&
        props.callbacks.confirmed(payload);

      toast("Released", "success");
      setPaymentStatus(EscrowStatus.RELEASED);
      setSuccess(payload.transactionHash);
      setIsLoading(false);
    },
  };

  const onRelease = () => {
    release(props.escrowId, releaseCallbacks).catch((e) => {
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

    if (!escrowData) {
      return null;
    }

    if (!(isLoading || protect.canRelease)) {
      return <Forbidden onClose={onModalClose} description={protect.reason} />;
    }

    return (
      <>
        <Amount
          precision={escrowData.token.decimals}
          amount={displayableAmount(
            escrowData.amount,
            escrowData.token.decimals,
          )}
          tokenSymbol={escrowData.token.symbol}
          status={paymentStatus}
        />
        <Subtitle>Payment Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            copy={escrowData.seller}
            label="Seller"
            value={addressWithYou(
              escrowData.seller,
              escrowData.connectedWallet,
            )}
            marker={MARKER.seller}
          />
          <DataDisplayer
            copy={escrowData.buyer}
            label="Buyer"
            value={addressWithYou(escrowData.buyer, escrowData.connectedWallet)}
            marker={MARKER.buyer}
          />

          <DataDisplayer label={labelChallengePeriod} value={countdown} />
          <DataDisplayer
            hide={!escrowData?.marketplace}
            label="Marketplace Address"
            value={reduceAddress(
              escrowData.marketplace,
              escrowData.ensAddresses?.marketplace,
            )}
            copy={escrowData.marketplace}
            marker={MARKER.marketplace}
          />
        </ContainerDataDisplayer>
      </>
    );
  };

  const ModalFooter = () => {
    if (!(isCorrectNetwork && (isLoading || protect.canRelease))) {
      return null;
    }

    let buttonChildren;
    let buttonOnClick;

    if (!escrowData) {
      buttonChildren = "Confirm Release";
      buttonOnClick = () => "";
    } else if (!(error || success)) {
      buttonChildren = "Confirm Release";
      buttonOnClick = onRelease;
    } else if (success) {
      buttonChildren = "Close";
      buttonOnClick = onModalClose;
    } else {
      buttonChildren = "Retry";
      buttonOnClick = onRelease;
    }

    return (
      <Button fullWidth disabled={isLoading} onClick={buttonOnClick}>
        {buttonChildren}
      </Button>
    );
  };

  const renderBody = () => {
    if (isCorrectNetwork && !escrowData) {
      return null;
    }

    return <ModalBody />;
  };

  const renderFooter = () => {
    if (!(isCorrectNetwork && (isCorrectNetwork || escrowData))) {
      return null;
    }

    return <ModalFooter />;
  };

  return (
    <ScopedModal
      title={"Release Payment"}
      body={renderBody()}
      footer={renderFooter()}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  );
}
