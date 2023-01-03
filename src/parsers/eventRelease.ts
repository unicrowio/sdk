import { ReleaseParsedPayload } from "../typing";
import { ADDRESS_ZERO, bipsToPercentage, toDate } from "../helpers";
import { getEventByName } from "./common";

export const parseRelease = (events: any[]): ReleaseParsedPayload => {
  const _event = getEventByName("Release", events);
  const [escrow_id, released_at, escrow, amounts] = _event.args;

  const [
    amount_buyer,
    amount_seller,
    amount_marketplace,
    amount_protocol,
    amount_arbitrator,
  ] = amounts;

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

  const marketplace: string =
    _marketplace === ADDRESS_ZERO ? null : _marketplace.toString();
  const marketplaceFee = bipsToPercentage([_marketplaceFee.toString()])[0];

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    releasedAt: toDate(released_at),
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
    amountBuyer: amount_buyer.toString(),
    amountSeller: amount_seller.toString(),
    amountMarketplace: amount_marketplace.toString(),
    amountProtocol: amount_protocol.toString(),
    amountArbitrator: amount_arbitrator.toString(),
  };
};
