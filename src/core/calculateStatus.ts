import { isSameAddress } from '../helpers'
import { ADDRESS_ZERO, BUYER, SELLER } from '../helpers/constants'
import { EscrowStatus, ICalculateStatusParams, IEscrowStatus } from '../typing'

const whoMadeLatestSettlementOffer = (
  seller: string,
  latest_settlement_offer_address?: string
) => {
  if (
    !latest_settlement_offer_address ||
    latest_settlement_offer_address === ADDRESS_ZERO
  )
    return null

  return isSameAddress(latest_settlement_offer_address, seller)
    ? 'seller'
    : 'buyer'
}

/**
 * Retrieves Escrow status calculated based on consensus, split, expire time and claim status.
 *
 * @typeParam ICalculateStatusParams (interface with seller, info of consensus and split, expires, claimed, ...)
 * @returns IEscrowStatus (interface with EscrowStatus, claimed, EscrowStatusLatestParty, EscrowStatusLatestParty)
 */
export const calculateStatus = ({
  seller,
  consensusBuyer,
  consensusSeller,
  splitSeller,
  splitBuyer,
  expires,
  claimed,
  latestSettlementOfferAddress
}: ICalculateStatusParams): IEscrowStatus => {
  const latestSettlementOffer = whoMadeLatestSettlementOffer(
    seller,
    latestSettlementOfferAddress
  )

  const isTimeExpired = Date.now() >= expires.getTime()

  const isChallenged =
    (consensusBuyer > 0 && consensusSeller < 0) ||
    (consensusBuyer < 0 && consensusSeller > 0)

  let latestChallenge: 'buyer' | 'seller' | null = null

  if (isChallenged) {
    latestChallenge = consensusBuyer > 0 && consensusSeller < 0 ? BUYER : SELLER
  }

  // Settled between buyer and seller (i.e. partial refund for the buyer)
  if (splitBuyer > 0 && splitSeller > 0) {
    return {
      state: EscrowStatus.SETTLED,
      latestChallenge,
      latestSettlementOffer,
      claimed
    }
  }

  // Fully refunded to the buyer
  if (consensusBuyer > 0 && consensusSeller > 0 && splitBuyer === 100) {
    return {
      state: EscrowStatus.REFUNDED,
      latestChallenge: null,
      latestSettlementOffer,
      claimed
    }
  }

  // Released manually without a challenge
  if (consensusSeller === 1 && consensusBuyer === 1) {
    return {
      state: EscrowStatus.RELEASED,
      latestChallenge: null,
      latestSettlementOffer,
      claimed
    }
  }

  // Released manually after a challenge
  if (consensusSeller > 1 && consensusBuyer > 1) {
    return {
      state: EscrowStatus.RELEASED,
      latestChallenge: consensusSeller === consensusBuyer ? BUYER : SELLER,
      latestSettlementOffer,
      claimed
    }
  }

  // Challenged
  if (isChallenged) {
    let state = null
    if (isTimeExpired) {
      state = EscrowStatus.PERIOD_EXPIRED
    } else {
      state = EscrowStatus.CHALLENGED
    }

    return {
      state,
      latestChallenge,
      latestSettlementOffer,
      claimed
    }
  }

  // Challenge period expired without a challenge
  if (isTimeExpired) {
    return {
      state: EscrowStatus.PERIOD_EXPIRED,
      latestChallenge: null,
      latestSettlementOffer,
      claimed
    }
  } else {
    // Paid, not challenged, challenge period not expired
    return {
      state: EscrowStatus.PAID,
      latestChallenge: null,
      latestSettlementOffer,
      claimed
    }
  }
}
