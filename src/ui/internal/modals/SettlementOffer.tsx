import React from "react";
import {
  ISettlementTransactionPayload,
  ISettlementOfferTransactionCallbacks,
  ISettlementOfferModalProps,
  IGetEscrowData,
  OfferSettlementParsedPayload,
} from "../../../typing";
import { Button } from "../../../ui/internal/components/Button";
import styled from "styled-components";
import { offerSettlement } from "../../../core/offerSettlement";
import { toast } from "../notification/toast";
import { SELLER, BUYER } from "../../../helpers";
import { FormattedPercentageAmountAdornment } from "../../../ui/internal/components/FormattedPercentageAmountAdornment";
import { renderModal } from "../config/render";
import { ApproveSettlementModal } from "./ApproveSettlement";
import { InputText, ScopedModal, Stack } from "../components";
import { AdornmentContent } from "../components/InputText";
import { Forbidden } from "../components/Forbidden";
import { getEscrowData } from "../../../core/getEscrowData";
import { useNetworkCheck } from "../hooks/useNetworkCheck";
import { useModalStates } from "ui/internal/hooks/useModalStates";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { ModalBodySkeleton } from "../components/ModalBodySkeleton";

const ContainerButtons = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
`;

const LabelFees = styled.div`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  margin-top: -10px;
  color: #c4c4c4;
`;

const ContainerModalFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function SettlementOfferModal({
  escrowId,
  escrowData,
  deferredPromise,
  callbacks,
}: ISettlementOfferModalProps) {
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    error,
    setError,
    onModalClose,
  } = useModalStates({ deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const { isCorrectNetwork } = useNetworkCheck();

  const _splitBuyer = escrowData?.settlement?.latestSettlementOfferBuyer || "";
  const _splitSeller =
    escrowData?.settlement?.latestSettlementOfferSeller || "";

  const [sellerValue, setSellerValue] = React.useState<string>(
    String(_splitSeller),
  );
  const [buyerValue, setBuyerValue] = React.useState<string>(
    String(_splitBuyer),
  );

  const [focus, setFocus] = React.useState<"buyer" | "seller">("buyer");

  const [escrow, setEscrow] = React.useState<IGetEscrowData | null>();

  const [labelBuyer, labelSeller] = React.useMemo(() => {
    if (escrow?.connectedUser === BUYER) {
      return ["You should get back", "Seller should receive"];
    }

    return ["Buyer should get back", "You should receive"];
  }, [escrow]);

  const loadData = async () => {
    if (isCorrectNetwork) {
      setIsLoading(true);
      setLoadingMessage("Getting Escrow information");
      getEscrowData(escrowId)
        .then((data: IGetEscrowData) => {
          const settlementModalProps: ISettlementOfferModalProps = {
            escrowId,
            escrowData: data,
            deferredPromise,
            callbacks,
          };

          if (data.status.latestSettlementOfferBy) {
            onModalClose("change");
            renderModal(ApproveSettlementModal, settlementModalProps);
          }

          setEscrow(data);
        })
        .catch((e) => {
          toast.error(e);
          onModalClose();
        })
        .finally(() => {
          setLoadingMessage("");
          setIsLoading(false);
        });
    }
  };

  React.useEffect(() => {
    if (escrowData) {
      setEscrow(escrowData);
    }
    if (!(escrow || escrowData)) {
      loadData();
    }
  }, [escrow, escrowData, isCorrectNetwork]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement & { name: "buyer" | "seller" }>,
  ) => {
    if (event.target.name === "seller") {
      setSellerValue(event.target.value);
      setBuyerValue(String(100 - Number(event.target.value)));
    } else {
      setSellerValue(String(100 - Number(event.target.value)));
      setBuyerValue(event.target.value);
    }

    setFocus(event.target.name);
  };

  const settlementCallbacks: ISettlementOfferTransactionCallbacks = {
    connectingWallet: () => {
      setIsLoading(true);
      setLoadingMessage("Connecting");
      callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
    },
    connected: (address: string) => {
      setLoadingMessage("Connected");
      callbacks && callbacks.connected && callbacks.connected(address);
    },
    broadcasting: () => {
      setLoadingMessage("Waiting for approval");
      callbacks && callbacks.broadcasting && callbacks.broadcasting();
    },
    broadcasted: (payload: ISettlementTransactionPayload) => {
      callbacks && callbacks.broadcasted && callbacks.broadcasted(payload);
      setLoadingMessage("Waiting confirmation");
    },
    confirmed: (payload: OfferSettlementParsedPayload) => {
      callbacks && callbacks.confirmed && callbacks.confirmed(payload);

      toast.success("Offer sent successfully");
      setSuccess(payload);
      setIsLoading(false);
    },
  };

  const onSubmitNewOffer = React.useCallback(
    (e: any) => {
      e.preventDefault();
      setIsLoading(true);
      offerSettlement(
        escrowId,
        Number(buyerValue),
        Number(sellerValue),
        settlementCallbacks,
      )
        .then(() => {
          setError(null);
          const settlementModalProps: ISettlementOfferModalProps = {
            escrowId,
            deferredPromise,
            callbacks,
          };

          renderModal(ApproveSettlementModal, settlementModalProps);
        })
        .catch((e) => {
          toast.error(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [buyerValue, sellerValue],
  );

  const onCancel = () => {
    if (escrowData) {
      const settlementModalProps: ISettlementOfferModalProps = {
        escrowId,
        escrowData: escrow,
        deferredPromise,
        callbacks,
      };

      renderModal(ApproveSettlementModal, settlementModalProps);
    } else {
      onModalClose("change");
    }
  };

  const renderButtons = () => {
    if (error) {
      return (
        <Button fullWidth type="submit" variant="secondary">
          Retry
        </Button>
      );
    }

    if (success) {
      return (
        <Button fullWidth variant="primary" onClick={onModalClose}>
          Close
        </Button>
      );
    }

    return (
      <>
        <Button fullWidth type="button" variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading} fullWidth>
          Submit
        </Button>
      </>
    );
  };

  const ModalBody = () => {
    if (
      !isLoading &&
      escrow &&
      ![BUYER, SELLER].includes(escrow?.connectedUser)
    ) {
      return <Forbidden onClose={onModalClose} />;
    }

    if (escrow?.status.claimed) {
      return (
        <Forbidden
          onClose={onModalClose}
          description="The payment is already claimed"
        />
      );
    }

    if (!escrow) {
      return <ModalBodySkeleton />;
    }

    return (
      <Stack>
        <InputText
          autoFocus={focus === "buyer"}
          required
          disabled={!!success}
          name="buyer"
          id="buyer"
          key="buyer"
          label={labelBuyer}
          placeholder="0"
          onChange={handleChange}
          value={buyerValue}
          min="0"
          max="100"
          type="number"
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>,
          }}
          adornmentEnd={{
            content: escrow && (
              <FormattedPercentageAmountAdornment
                amount={escrow.amount}
                tokenInfo={escrow.token}
                percentage={buyerValue}
              />
            ),
            options: { hideBorder: true },
          }}
        />

        <InputText
          autoFocus={focus === "seller"}
          required
          disabled={!!success}
          name="seller"
          id="seller"
          key="seller"
          placeholder="0"
          label={labelSeller}
          value={sellerValue}
          min="0"
          max="100"
          type="number"
          onChange={handleChange}
          adornmentStart={{
            content: <AdornmentContent>%</AdornmentContent>,
          }}
          adornmentEnd={{
            content: escrow && (
              <FormattedPercentageAmountAdornment
                amount={escrow.amount}
                tokenInfo={escrow.token}
                percentage={sellerValue}
              />
            ),
            options: { hideBorder: true },
          }}
        />

        {!isLoading && escrow && escrow.connectedUser === SELLER && (
          <LabelFees>
            Fees will be reduced proportionally to your share
          </LabelFees>
        )}
      </Stack>
    );
  };

  const ModalFooter = () => {
    if (
      !escrow ||
      escrow.status.claimed ||
      ![BUYER, SELLER].includes(escrow.connectedUser)
    ) {
      return null;
    }
    return (
      <ContainerModalFooter>
        <ContainerButtons>{renderButtons()}</ContainerButtons>
      </ContainerModalFooter>
    );
  };

  return (
    <form ref={closeHandlerRef} autoComplete="off" onSubmit={onSubmitNewOffer}>
      <ScopedModal
        title={"Settlement Offer"}
        body={ModalBody()}
        footer={ModalFooter()}
        onClose={onModalClose}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />
    </form>
  );
}
