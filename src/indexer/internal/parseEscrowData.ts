import BigNumber from "bignumber.js";
import {
  EscrowStatus,
  tEscrowParty,
  EscrowStatusView,
  IEscrowData,
} from "../../typing";
import {
  isSameAddress,
  BUYER,
  nullOrValue,
  SELLER,
  toDate,
} from "../../helpers";

export const parseEscrowData = (item: EscrowStatusView): IEscrowData => {
  /**
   * When consensus of the buyer is equal to the seller,
   * who did the last challenge was the buyer otherwise seller.
   */
  const latestChallenge = (() => {
    let latestChallenge: "buyer" | "seller" | null = null;
    if (
      EscrowStatus[item.status] === EscrowStatus.CHALLENGED ||
      EscrowStatus[item.status] === EscrowStatus.REFUNDED
    ) {
      const isBuyerLatestChallenge =
        Math.abs(item.consensus_seller) === Math.abs(item.consensus_buyer);
      latestChallenge = isBuyerLatestChallenge ? BUYER : SELLER;
    }

    return latestChallenge;
  })();

  const latestSettlementOffer = ((): tEscrowParty => {
    if (!item.latest_settlement_offer_address) return null;

    return isSameAddress(item.latest_settlement_offer_address, item.buyer)
      ? BUYER
      : SELLER;
  })();

  const state = EscrowStatus[item.status];

  return {
    challengePeriodStart: toDate(item.challenge_period_start),
    challengePeriodEnd: toDate(item.challenge_period_end),
    challengePeriod: item.challenge_period,
    status: {
      state,
      latestChallengeBy: latestChallenge,
      latestSettlementOfferBy: latestSettlementOffer,
      claimed: item.claimed,
    },

    escrowId: item.escrow_id,

    // Token
    amount: new BigNumber(item.amount),

    // Addresses
    marketplace: nullOrValue(item.marketplace),
    buyer: item.buyer,
    seller: item.seller,
    token: {
      address: item.currency,
    },
    // Splits
    splitMarketplace: item.split_marketplace,
    splitBuyer: item.split_buyer,
    splitSeller: item.split_seller,
    splitProtocol: item.split_protocol,

    // Consensus
    consensusBuyer: item.consensus_buyer,
    consensusSeller: item.consensus_seller,

    // item.paid_at comes as seconds
    createdAt: toDate(item.paid_at),

    // Settlement
    latestSettlementOfferAddress: item.latest_settlement_offer_address,
    latestSettlementOfferSeller: item.latest_settlement_offer_seller,
    latestSettlementOfferBuyer: item.latest_settlement_offer_buyer,
  };
};
