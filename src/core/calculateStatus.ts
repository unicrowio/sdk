import { isSameAddress, ADDRESS_ZERO, BUYER, SELLER } from "../helpers";
import { EscrowStatus, ICalculateStatusParams, IEscrowStatus } from "../typing";

const whoMadeLatestSettlementOffer = (
  seller: string,
  latest_settlement_offer_address?: string,
) => {
  if (
    !latest_settlement_offer_address ||
    latest_settlement_offer_address === ADDRESS_ZERO
  )
    return null;

  return isSameAddress(latest_settlement_offer_address, seller)
    ? "seller"
    : "buyer";
};

/**
 * Retrieves Escrow status calculated based on consensus, split, expire time and claim status.
 *
 * @returns IEscrowStatus - (interface with EscrowStatus, claimed, tEscrowParty, tEscrowParty)
 */
export const calculateStatus = ({
  seller,
  consensusBuyer,
  consensusSeller,
  splitSeller,
  splitBuyer,
  expires,
  claimed,
  latestSettlementOfferAddress,
}: ICalculateStatusParams): IEscrowStatus => {
  const latestSettlementOfferBy = whoMadeLatestSettlementOffer(
    seller,
    latestSettlementOfferAddress,
  );

  const isTimeExpired = Date.now() >= expires.getTime();

  const isChallenged =
    (consensusBuyer > 0 && consensusSeller < 0) ||
    (consensusBuyer < 0 && consensusSeller > 0);

  let latestChallengeBy: "buyer" | "seller" | null = null;

  if (isChallenged) {
    latestChallengeBy =
      consensusBuyer > 0 && consensusSeller < 0 ? BUYER : SELLER;
  }

  // Settled between buyer and seller (i.e. partial refund for the buyer)
  if (splitBuyer > 0 && splitSeller > 0) {
    return {
      state: EscrowStatus.SETTLED,
      latestChallengeBy,
      latestSettlementOfferBy,
      claimed,
    };
  }

  // Fully refunded to the buyer
  if (consensusBuyer > 0 && consensusSeller > 0 && splitBuyer === 100) {
    return {
      state: EscrowStatus.REFUNDED,
      latestChallengeBy: null,
      latestSettlementOfferBy,
      claimed,
    };
  }

  // Released manually without a challenge
  if (consensusSeller === 1 && consensusBuyer === 1) {
    return {
      state: EscrowStatus.RELEASED,
      latestChallengeBy: null,
      latestSettlementOfferBy,
      claimed,
    };
  }

  // Released manually after a challenge
  if (consensusSeller > 1 && consensusBuyer > 1) {
    return {
      state: EscrowStatus.RELEASED,
      latestChallengeBy: consensusSeller === consensusBuyer ? BUYER : SELLER,
      latestSettlementOfferBy,
      claimed,
    };
  }

  // Challenged
  if (isChallenged) {
    let state = null;
    if (isTimeExpired) {
      state = EscrowStatus.PERIOD_EXPIRED;
    } else {
      state = EscrowStatus.CHALLENGED;
    }

    return {
      state,
      latestChallengeBy,
      latestSettlementOfferBy,
      claimed,
    };
  }

  // Challenge period expired without a challenge
  if (isTimeExpired) {
    return {
      state: EscrowStatus.PERIOD_EXPIRED,
      latestChallengeBy: null,
      latestSettlementOfferBy,
      claimed,
    };
  } else {
    // Paid, not challenged, challenge period not expired
    return {
      state: EscrowStatus.PAID,
      latestChallengeBy: null,
      latestSettlementOfferBy,
      claimed,
    };
  }
};
