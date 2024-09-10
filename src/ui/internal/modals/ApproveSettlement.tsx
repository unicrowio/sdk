import React from "react";
import {
  ISettlementTransactionPayload,
  ISettlementApproveTransactionCallbacks,
  ISettlementApproveModalProps,
  ApproveSettlementParsedPayload,
} from "../../../typing";
import {
  Subtitle,
  Amount,
  TokenSymbol,
  Button,
  ScopedModal,
} from "../../../ui/internal/components";
import { calculatePercentageInt } from "../../../core/calculateAmounts";
import { useModalStates } from "../../../ui/internal/hooks/useModalStates";
import { toast } from "../notification/toast";
import styled from "styled-components";
import { approveSettlement } from "../../../core";
import {
  ContainerDataDisplayer,
  DataDisplayer,
} from "../components/DataDisplayer";
import { renderModal } from "../config/render";
import { formatAmount, BUYER, SELLER } from "../../../helpers";
import { SettlementOfferModal } from "./SettlementOffer";

import { MARKER } from "../../../config/marker";
import { ModalAction } from "../components/Modal";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";
import { useEscrowData } from "ui/internal/hooks/useEscrowData";

const ContainerButtons = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;
const LabelFees = styled.p`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #c4c4c4;
`;

export function ApproveSettlementModal(props: ISettlementApproveModalProps) {
  const { escrowData: propsData, escrowId, callbacks, deferredPromise } = props;
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose,
  } = useModalStates({ deferredPromise });

  const { data: escrowData, isLoading: isLoadingEscrow } = useEscrowData({
    escrowId,
    defaultValue: propsData,
  });

  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const isLoadingAnything = isLoadingEscrow || isLoading;

  const labelAmountSplit = React.useMemo(() => {
    if (escrowData?.settlement) {
      const _splitBuyer =
        escrowData.settlement.latestSettlementOfferBuyer;
      const _splitSeller =
        escrowData.settlement.latestSettlementOfferSeller;

      const _amountBuyer = calculatePercentageInt(
        _splitBuyer,
        escrowData.amount,
      );
      const _amountSeller = calculatePercentageInt(
        _splitSeller,
        escrowData.amount,
      );

      const _amountBuyerDisplayable = formatAmount(
        _amountBuyer,
        escrowData.token.decimals,
      );

      const _sellerBuyerDisplayable = formatAmount(
        _amountSeller,
        escrowData.token.decimals,
      );

      return {
        buyer: {
          amount: _amountBuyerDisplayable,
          symbol: escrowData.token.symbol,
          percentage: escrowData.settlement.latestSettlementOfferBuyer,
        },
        seller: {
          amount: _sellerBuyerDisplayable,
          symbol: escrowData.token.symbol,
          percentage: escrowData.settlement.latestSettlementOfferSeller,
        },
      };
    }
    return null;
  }, [escrowData]);

  const title = React.useMemo(() => {
    if (escrowData?.settlement && escrowData?.connectedUser) {
      if (
        escrowData.connectedUser === BUYER &&
        escrowData.status.latestSettlementOfferBy === BUYER
      ) {
        return "Settlement Offered by You";
      } else if (
        escrowData.connectedUser === SELLER &&
        escrowData.status.latestSettlementOfferBy === SELLER
      ) {
        return "Settlement Offered by You";
      } else if (
        escrowData.connectedUser === BUYER &&
        escrowData.status.latestSettlementOfferBy !== BUYER
      ) {
        return "Settlement Offered by Seller";
      } else if (
        escrowData.connectedUser === SELLER &&
        escrowData.status.latestSettlementOfferBy !== SELLER
      ) {
        return "Settlement Offered by Buyer";
      }
    }
    return "Approve Settlement";
  }, [escrowData]);

  const [labelBuyer, labelSeller] = React.useMemo(() => {
    if (escrowData?.connectedUser === BUYER) {
      return ["You will get back", "Seller will receive"];
    }

    return ["Buyer will get back", "You will receive"];
  }, [escrowData]);

  const displayActionButtons = React.useMemo(
    () =>
      escrowData?.status.latestSettlementOfferBy !== escrowData?.connectedUser,
    [escrowData],
  );

  React.useEffect(() => {
    if (escrowData) {
      if (![BUYER, SELLER].includes(escrowData.connectedUser)) {
        setModalAction({
          isForbidden: true,
        });
      } else {
        if (!escrowData.settlement) {
          toast.error("There is no settlement to this escrow");
          throw new Error("There is no settlement to this escrow");
        }
      }
    }
  }, [escrowData]);

  const approveSettlementOfferCallbacks: ISettlementApproveTransactionCallbacks =
    {
      connectingWallet: () => {
        setIsLoading(true);
        setLoadingMessage("Connecting");
        callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
      },
      broadcasting: () => {
        setLoadingMessage("Waiting for approval");
        callbacks && callbacks.broadcasting && callbacks.broadcasting();
      },
      broadcasted: (payload: ISettlementTransactionPayload) => {
        callbacks && callbacks.broadcasted && callbacks.broadcasted(payload);
        setLoadingMessage("Waiting for confirmation");
      },
      confirmed: (payload: ApproveSettlementParsedPayload) => {
        callbacks && callbacks.confirmed && callbacks.confirmed(payload);

        toast.success("Accepted");

        setSuccess(payload.transactionHash);
        setIsLoading(false);
      },
    };

  const onAcceptClick = React.useCallback(() => {
    if (escrowData && escrowId) {
      approveSettlement(
        escrowId,
        escrowData?.settlement?.latestSettlementOfferBuyer,
        escrowData?.settlement?.latestSettlementOfferSeller,
        approveSettlementOfferCallbacks,
      ).catch((e) => {
        setIsLoading(false);
        toast.error(e);
      });
    }
  }, [escrowId, escrowData]);

  const ModalBody = React.useCallback(() => {
    if (!escrowData) {
      return null;
    }

    return (
      <>
        <Amount
          amount={formatAmount(escrowData.amount, escrowData.token.decimals)}
          precision={escrowData.token.decimals}
          tokenSymbol={
            escrowData.token?.symbol ? escrowData.token.symbol : "..."
          }
        />

        <Subtitle>Settlement Summary</Subtitle>
        <ContainerDataDisplayer>
          <DataDisplayer
            label={labelBuyer}
            value={
              <span>
                {labelAmountSplit?.buyer.amount}{" "}
                <TokenSymbol>{labelAmountSplit?.buyer.symbol}</TokenSymbol> (
                {labelAmountSplit?.buyer.percentage}%)
              </span>
            }
            marker={MARKER.buyer}
          />
          <DataDisplayer
            label={labelSeller}
            value={
              <span>
                {labelAmountSplit?.seller.amount}{" "}
                <TokenSymbol>
                  {labelAmountSplit?.seller.symbol}
                  {escrowData.connectedUser === SELLER && "*"}
                </TokenSymbol>{" "}
                ({labelAmountSplit?.seller.percentage}%)
              </span>
            }
            marker={MARKER.seller}
          />
          {escrowData.connectedUser === SELLER && (
            <LabelFees>
              * Fees will be deducted proportionally from your share
            </LabelFees>
          )}
        </ContainerDataDisplayer>
      </>
    );
  }, [escrowData, labelSeller, labelBuyer, labelAmountSplit]);

  const openNegotiateModal = async () => {
    onModalClose("change");

    if (escrowData) {
      const settlementModalProps: ISettlementApproveModalProps = {
        escrowId,
        escrowData,
        deferredPromise,
        callbacks,
      };
      renderModal(SettlementOfferModal, settlementModalProps);
    }
  };

  const ModalFooter = React.useCallback(() => {
    if (!escrowData) {
      return null;
    }

    if (success || escrowData.status.claimed) {
      return (
        <ContainerButtons>
          <Button fullWidth variant="primary" onClick={() => onModalClose()}>
            Close
          </Button>
        </ContainerButtons>
      );
    }
    return displayActionButtons ? (
      <>
        <ContainerButtons>
          <Button fullWidth variant="secondary" onClick={openNegotiateModal}>
            Negotiate
          </Button>
          <Button
            variant="primary"
            disabled={isLoadingAnything}
            fullWidth
            onClick={onAcceptClick}
          >
            Accept
          </Button>
        </ContainerButtons>
      </>
    ) : (
      <ContainerButtons>
        <Button fullWidth variant="secondary" onClick={openNegotiateModal}>
          Change
        </Button>
        <Button fullWidth variant="primary" onClick={() => onModalClose()}>
          Close
        </Button>
      </ContainerButtons>
    );
  }, [displayActionButtons, isLoadingAnything, escrowData]);

  return (
    <div ref={closeHandlerRef}>
      <ScopedModal
        title={title}
        body={<ModalBody />}
        footer={<ModalFooter />}
        onClose={onModalClose}
        isLoading={isLoadingAnything}
        loadingMessage={loadingMessage}
        modalAction={modalAction}
      />
    </div>
  );
}
