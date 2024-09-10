import { nullOrValue, bipsToPercentage, toDate } from "../../../helpers";
import { ArbitrateParsedPayload } from "../../../typing";
import { getEventByName } from "./common";

export const parseArbitrate = (events: any[]): ArbitrateParsedPayload => {
  const _event = getEventByName("Arbitrated", events);

  const [escrowId, escrow, settled_at, amounts] = _event.args;

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
    paymentReference,
  ] = escrow;

  const [splitBuyer, splitSeller, splitMarketplace, splitProtocol] =
    bipsToPercentage(splits);

  const [consensusBuyer, consensusSeller] = consensus;

  const [
    amount_buyer,
    amount_seller,
    amount_marketplace,
    amount_protocol,
    amount_arbitrator,
  ] = amounts;

  const marketplace: string | null = nullOrValue(_marketplace);
  const marketplaceFee = bipsToPercentage([_marketplaceFee.toString()])[0];
  const tokenAddress: string | null = nullOrValue(currency);

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    escrowId: Number(escrowId),
    settledAt: toDate(settled_at),
    buyer: buyer.toString(),
    seller: seller.toString(),
    challengePeriodExtension: Number(challengeExtension?.toString()),
    challengePeriodStart: toDate(challengePeriodStart),
    challengePeriodEnd: toDate(challengePeriodEnd),
    marketplace,
    marketplaceFee,
    tokenAddress,
    paymentReference,
    claimed: !!claimed,
    consensusBuyer: Number(consensusBuyer),
    consensusSeller: Number(consensusSeller),
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
