import React from "react";
import {
  ISettlementTransactionPayload,
  ISettlementApproveTransactionCallbacks,
  ISettlementApproveModalProps,
  ISettlementOfferModalProps,
  ISettlementOfferTransactionCallbacks,
  IGetEscrowData,
  ApproveSettlementParsedPayload,
} from "../../typing";
import {
  Subtitle,
  Amount,
  TokenSymbol,
  Button,
  ScopedModal,
} from "../../ui/components";
import { useModalStates } from "../../ui/hooks/useModalStates";
import { toast } from "../notification/toast";
import styled from "styled-components";
import { approveSettlement, getEscrowData } from "../../core";
import {
  ContainerDataDisplayer,
  DataDisplayer,
} from "../components/DataDisplayer";
import { renderModal } from "../config/render";
import { displayableAmount, BUYER, SELLER } from "../../helpers";
import { SettlementOfferModal } from "./SettlementOffer";
import { Forbidden } from "../components/Forbidden";

import { MARKER } from "../../config/marker";
import {
  isCorrectNetworkConnected,
  startListeningNetwork,
  switchNetwork,
} from "wallet";
import { DefaultNetwork } from "config/setup";
import { IncorrectNetwork } from "ui/components/IncorrectNetwork";

const ContainerButtons = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
  margin-top: -28px;
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
  const { escrowId, callbacks, deferredPromise } = props;
  const {
    success,
    setSuccess,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    onModalClose,
  } = useModalStates({ deferredPromise });

  const [escrow, setEscrow] = React.useState<IGetEscrowData | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] =
    React.useState<boolean>(false);

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
    if (escrow?.settlement && escrow.connectedUser) {
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
    return isCorrectNetwork ? null : "Approve Settlement";
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

  const onNetworkSwitch = async () => {
    await switchNetwork(globalThis.defaultNetwork.name as DefaultNetwork);
    setIsCorrectNetwork(await isCorrectNetworkConnected());
  };

  const loadData = async () => {
    const isCorrect = await isCorrectNetworkConnected();
    setIsCorrectNetwork(isCorrect);

    if (isCorrect) {
      setIsLoading(true);
      setLoadingMessage("Getting Escrow information");
      getEscrowData(escrowId)
        .then((data: IGetEscrowData) => {
          if (!data.settlement) {
            throw new Error("There is no settlement to this escrow");
          }
          setEscrow(data);
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
        setLoadingMessage("Waiting confirmation");
      },
      confirmed: (payload: ApproveSettlementParsedPayload) => {
        callbacks.confirmed?.(payload);

        toast("Accepted", "success");

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
        toast(e, "error");
      });
    }
  }, [escrowId, escrow]);

  const ModalBody = React.useCallback(() => {
    if (!isCorrectNetwork) {
      return <IncorrectNetwork onClick={onNetworkSwitch} />;
    }

    if (!escrow) {
      return null;
    }

    if (!(isLoading || [BUYER, SELLER].includes(escrow.connectedUser))) {
      return <Forbidden onClose={onModalClose} />;
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
  }, [labelSeller, labelBuyer, labelAmountSplit]);

  const openNegotiateModal = async () => {
    onModalClose();

    if (escrow) {
      const settlementModalProps: ISettlementOfferModalProps = {
        escrowId,
        escrowData: escrow,
        deferredPromise,
        callbacks: callbacks as ISettlementOfferTransactionCallbacks,
      };
      renderModal(SettlementOfferModal, settlementModalProps);
    }
  };

  const ModalFooter = React.useCallback(() => {
    if (!(isCorrectNetwork && escrow)) {
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
            disabled={isLoading}
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
  }, [displayActionButtons, isLoading, escrow]);

  const renderBody = () => {
    if (isCorrectNetwork && !escrow) {
      return null;
    }

    return <ModalBody />;
  };

  const renderFooter = () => {
    // TODO: check if we can simplify this to "if (!isCorrectNetwork || !escrow) {"
    if (!(isCorrectNetwork && (isCorrectNetwork || escrow))) {
      return null;
    }

    return <ModalFooter />;
  };

  return (
    <ScopedModal
      title={title}
      body={renderBody()}
      footer={renderFooter()}
      onClose={onModalClose}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
    />
  );
}
