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
import { useModalStates } from "../../../ui/internal/hooks/useModalStates";
import { toast } from "../notification/toast";
import styled from "styled-components";
import { approveSettlement, getEscrowData } from "../../../core";
import {
  ContainerDataDisplayer,
  DataDisplayer,
} from "../components/DataDisplayer";
import { renderModal } from "../config/render";
import { displayableAmount, BUYER, SELLER } from "../../../helpers";
import { SettlementOfferModal } from "./SettlementOffer";

import { MARKER } from "../../../config/marker";
import { useAsync } from "../hooks/useAsync";
import { ModalAction } from "../components/Modal";
import { useModalCloseHandler } from "../hooks/useModalCloseHandler";

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
  const { escrowData, escrowId, callbacks, deferredPromise } = props;
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose,
  } = useModalStates({ deferredPromise });
  const closeHandlerRef = useModalCloseHandler(onModalClose);
  const [modalAction, setModalAction] = React.useState<ModalAction>();
  const [escrow, isLoadingEscrow] = useAsync(
    escrowId,
    escrowData ? null : getEscrowData, // this only runs if escrowData is null
    onModalClose,
    escrowData,
  );

  const isLoadingAnything = isLoadingEscrow || isLoading;

  const labelAmountSplit = React.useMemo(() => {
    if (escrow?.settlement) {
      const _splitBuyer = escrow.settlement.latestSettlementOfferBuyer / 100;
      const _splitSeller = escrow.settlement.latestSettlementOfferSeller / 100;

      const _amountBuyer = escrow.amount.times(_splitBuyer);
      const _amountSeller = escrow.amount.times(_splitSeller);

      const _amountBuyerDisplayable = displayableAmount(
        _amountBuyer,
        escrow.token.decimals,
      );

      const _sellerBuyerDisplayable = displayableAmount(
        _amountSeller,
        escrow.token.decimals,
      );

      return {
        buyer: {
          amount: _amountBuyerDisplayable,
          symbol: escrow.token.symbol,
          percentage: escrow.settlement.latestSettlementOfferBuyer,
        },

        seller: {
          amount: _sellerBuyerDisplayable,
          symbol: escrow.token.symbol,
          percentage: escrow.settlement.latestSettlementOfferSeller,
        },
      };
    }
    return null;
  }, [escrow]);

  const title = React.useMemo(() => {
    if (escrow?.settlement && escrow?.connectedUser) {
      if (
        escrow.connectedUser === BUYER &&
        escrow.status.latestSettlementOfferBy === BUYER
      ) {
        return "Settlement Offered by You";
      } else if (
        escrow.connectedUser === SELLER &&
        escrow.status.latestSettlementOfferBy === SELLER
      ) {
        return "Settlement Offered by You";
      } else if (
        escrow.connectedUser === BUYER &&
        escrow.status.latestSettlementOfferBy !== BUYER
      ) {
        return "Settlement Offered by Seller";
      } else if (
        escrow.connectedUser === SELLER &&
        escrow.status.latestSettlementOfferBy !== SELLER
      ) {
        return "Settlement Offered by Buyer";
      }
    }
    return "Approve Settlement";
  }, [escrow]);

  const [labelBuyer, labelSeller] = React.useMemo(() => {
    if (escrow?.connectedUser === BUYER) {
      return ["You will get back", "Seller will receive"];
    }

    return ["Buyer will get back", "You will receive"];
  }, [escrow]);

  const displayActionButtons = React.useMemo(() => {
    return escrow?.status.latestSettlementOfferBy !== escrow?.connectedUser;
  }, [escrow]);

  React.useEffect(() => {
    if (escrow) {
      if (![BUYER, SELLER].includes(escrow?.connectedUser)) {
        setModalAction({
          isForbidden: true,
        });
      } else {
        if (!escrow?.settlement) {
          toast.error("There is no settlement to this escrow");
          throw new Error("There is no settlement to this escrow");
        }
      }
    }
  }, [escrow]);

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
    if (escrow && escrowId) {
      approveSettlement(
        escrowId,
        escrow?.settlement!.latestSettlementOfferBuyer,
        escrow?.settlement!.latestSettlementOfferSeller,
        approveSettlementOfferCallbacks,
      ).catch((e) => {
        setIsLoading(false);
        toast.error(e);
      });
    }
  }, [escrowId, escrow]);

  const ModalBody = React.useCallback(() => {
    if (!escrow) {
      return null;
    }

    return (
      <>
        <Amount
          precision={escrow.token.decimals}
          amount={displayableAmount(escrow.amount, escrow.token.decimals)}
          tokenSymbol={escrow.token?.symbol ? escrow.token.symbol : "..."}
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
                  {escrow.connectedUser === SELLER && "*"}
                </TokenSymbol>{" "}
                ({labelAmountSplit?.seller.percentage}%)
              </span>
            }
            marker={MARKER.seller}
          />
          {escrow.connectedUser === SELLER && (
            <LabelFees>
              * Fees will be deducted proportionally from your share
            </LabelFees>
          )}
        </ContainerDataDisplayer>
      </>
    );
  }, [escrow, labelSeller, labelBuyer, labelAmountSplit]);

  const openNegotiateModal = async () => {
    onModalClose();

    if (escrow) {
      const settlementModalProps: ISettlementApproveModalProps = {
        escrowId,
        escrowData: escrow,
        deferredPromise,
        callbacks,
      };
      renderModal(SettlementOfferModal, settlementModalProps);
    }
  };

  const ModalFooter = React.useCallback(() => {
    if (!escrow) {
      return null;
    }

    if (success || escrow.status.claimed) {
      return (
        <ContainerButtons>
          <Button fullWidth variant="primary" onClick={onModalClose}>
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
        <Button fullWidth variant="primary" onClick={onModalClose}>
          Close
        </Button>
      </ContainerButtons>
    );
  }, [displayActionButtons, isLoadingAnything, escrow]);

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
