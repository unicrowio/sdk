import { ChallengeParsedPayload } from "../../../typing";
import {
  ADDRESS_ZERO,
  bipsToPercentage,
  nullOrValue,
  toDate,
} from "../../../helpers";
import { getEventByName } from "./common";

export const parseChallenge = (tx: any): ChallengeParsedPayload => {
  const _event = getEventByName("Challenge", tx.events);

  const [escrow_id, challenged_at, escrow] = _event.args;

  const [
    buyer,
    challengeExtension,
    seller,
    challengePeriodStart,
    _marketplace,
    _marketplaceFee,
    challengePeriodEnd,
    currency,
    claimed,
    consensus,
    splits,
    amount,
  ] = escrow;

  const [splitBuyer, splitSeller, splitMarketplace, splitProtocol] =
    bipsToPercentage(splits);

  const [consensusBuyer, consensusSeller] = consensus;

  const marketplace: string | null = nullOrValue(_marketplace);
  const marketplaceFee = bipsToPercentage([_marketplaceFee.toString()])[0];

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    challengedAt: toDate(challenged_at),
    escrowId: escrow_id.toNumber(),
    buyer: buyer.toString(),
    seller: seller.toString(),
    challengePeriodExtension: Number(challengeExtension?.toString()),
    challengePeriodStart: toDate(challengePeriodStart),
    challengePeriodEnd: toDate(challengePeriodEnd),
    marketplace,
    marketplaceFee,
    currency: currency.toString(),
    claimed: !!claimed,
    consensusBuyer,
    consensusSeller,
    splitBuyer,
    splitSeller,
    splitMarketplace,
    splitProtocol,
    amount: amount.toString(),
  };
};
