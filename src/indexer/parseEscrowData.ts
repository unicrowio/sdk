import BigNumber from 'bignumber.js'
import {
  EscrowStatus,
  tEscrowParty,
  EscrowStatusView,
  IEscrowData
} from '../typing'
import {
  isSameAddress,
  BUYER,
  NULL_MARKETPLACE_ADDRESS,
  SELLER
} from '../helpers'

export const parseEscrowData = (item: EscrowStatusView): IEscrowData => {
  /**
   * When consensus of the buyer is equal to the seller,
   * who did the last challenge was the buyer otherwise seller.
   */
  const latestChallenge = (() => {
    let latestChallenge: 'buyer' | 'seller' | null = null
    if (
      EscrowStatus[item.status] === EscrowStatus.CHALLENGED ||
      EscrowStatus[item.status] === EscrowStatus.REFUNDED
    ) {
      const isBuyerlatestChallenge =
        Math.abs(item.consensus_seller) === Math.abs(item.consensus_buyer)
      latestChallenge = isBuyerlatestChallenge ? BUYER : SELLER
    }

    return latestChallenge
  })()

  const latestSettlementOffer = ((): tEscrowParty => {
    if (!item.latest_settlement_offer_address) return null

    return isSameAddress(item.latest_settlement_offer_address, item.buyer)
      ? BUYER
      : SELLER
  })()

  const state = EscrowStatus[item.status]

  return {
    challengePeriodStart: new Date(item.challenge_period_start),
    challengePeriodEnd: new Date(item.challenge_period_end),
    challengePeriod: item.challenge_period,
    status: {
      state,
      latestChallengeBy: latestChallenge,
      latestSettlementOfferBy: latestSettlementOffer,
      claimed: item.claimed
    },

    escrowId: item.escrow_id,

    // Token
    amount: new BigNumber(item.amount),

    // Addresses
    marketplace:
      item.marketplace === NULL_MARKETPLACE_ADDRESS ? null : item.marketplace,
    buyer: item.buyer,
    seller: item.seller,
    tokenAddress: item.currency,

    // Splits
    splitMarketplace: item.split_marketplace,
    splitBuyer: item.split_buyer,
    splitSeller: item.split_seller,
    splitProtocol: item.split_protocol,

    // Consensus
    consensusBuyer: item.consensus_buyer,
    consensusSeller: item.consensus_seller,

    // item.paid_at comes as seconds
    createdAt: new Date(item.paid_at * 1000),

    // Settlement
    latestSettlementOfferAddress: item.latest_settlement_offer_address,
    latestSettlementOfferSeller: item.latest_settlement_offer_seller,
    latestSettlementOfferBuyer: item.latest_settlement_offer_buyer
  }
}
