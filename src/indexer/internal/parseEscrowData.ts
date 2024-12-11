import {
  IGetEscrowData,
  IToken,
  ISettlement,
  IArbitratorInfo,
} from "../../typing";
import { nullOrValue, toDate, bipsToPercentage } from "../../helpers";
import { calculateStatus } from "../../core/calculateStatus";
import { EscrowStatusView } from "indexer/internal/types";

const consensusArbitration = (status, proposer, seller) => {
  if (!status) {
    return { consensusBuyer: false, consensusSeller: false };
  }

  if (status === "ArbitratorApproved") {
    return { consensusBuyer: true, consensusSeller: true };
  }

  if (seller === proposer) {
    return { consensusBuyer: false, consensusSeller: true };
  } else {
    return { consensusBuyer: true, consensusSeller: false };
  }
};

/**
 * Parser of the Escrow that come from the indexer API.
 */
export const parseEscrowData = (
  item: EscrowStatusView,
): Omit<IGetEscrowData, "connectedUser" | "walletAddress"> => {
  console.log(item);

  const chainId = item.chain_id;

  const [splitBuyer, splitSeller, splitMarketplace, splitProtocol] =
    bipsToPercentage([
      item.split_buyer,
      item.split_seller,
      item.split_marketplace,
      item.split_protocol,
    ]);

  const amount =
    typeof item.amount === "bigint" ? item.amount : BigInt(item.amount);

  const buyer = item.buyer;
  const seller = item.seller;

  // Consensus
  const consensusBuyer = Number(item.consensus_buyer);
  const consensusSeller = Number(item.consensus_seller);

  const claimed = Boolean(item.claimed);

  const marketplace = nullOrValue(item.marketplace);

  const challengePeriodStart = toDate(item.challenge_period_start);
  const challengePeriodEnd = toDate(item.challenge_period_end);
  const challengePeriod = item.challenge_period;

  const latestSettlementOfferAddress = item.latest_settlement_offer_address;

  const status = calculateStatus({
    seller,
    consensusBuyer,
    consensusSeller,
    splitSeller,
    splitBuyer,
    expires: challengePeriodEnd,
    claimed,
    latestSettlementOfferAddress,
  });

  const token: IToken = {
    address: item.currency,
  };

  const escrow = {
    chainId,
    challengePeriod,
    challengePeriodStart,
    challengePeriodEnd,
    status,
    escrowId: item.escrow_id,
    amount,
    // Addresses
    marketplace,
    buyer,
    seller,
    // Splits
    splitMarketplace,
    splitBuyer,
    splitSeller,
    splitProtocol,
    // Consensus
    consensusBuyer,
    consensusSeller,
    paymentReference: item.payment_reference,
  };

  let settlement: ISettlement | null = null;
  if (item.latest_settlement_offer_address) {
    const [latestSettlementOfferSeller, latestSettlementOfferBuyer] =
      bipsToPercentage([
        item.latest_settlement_offer_seller,
        item.latest_settlement_offer_buyer,
      ]);

    settlement = {
      latestSettlementOfferAddress: nullOrValue(
        item.latest_settlement_offer_address,
      ),
      latestSettlementOfferSeller,
      latestSettlementOfferBuyer,
    };
  }

  let arbitration: IArbitratorInfo | null = null;
  if (item.arbitrator) {
    const arbitrationConsensus = consensusArbitration(
      item.status_arbitration,
      item.arbitrator_proposer,
      item.seller,
    );

    arbitration = {
      arbitrator: item.arbitrator,
      consensusSeller: arbitrationConsensus.consensusSeller,
      consensusBuyer: arbitrationConsensus.consensusBuyer,
      arbitrated: item.arbitrated,
      arbitratorFee: bipsToPercentage([item.arbitrator_fee || 0])[0],
    };
  }

  return {
    ...escrow,
    arbitration,
    settlement,
    token,
    marketplace,
  };
};
