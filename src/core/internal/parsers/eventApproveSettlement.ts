import { ApproveSettlementParsedPayload } from "../../../typing";
import { bipsToPercentage, toDate, nullOrValue } from "../../../helpers";
import { getEventByName } from "./common";

export const parseApproveSettlement = (
  events: any[],
): ApproveSettlementParsedPayload => {
  const _event = getEventByName("ApproveOffer", events);

  const [escrow_id, escrow, latest_settlement_offer, approved_at, amounts] =
    _event.args;

  const [lsoBuyer, lsoSeller] = bipsToPercentage(latest_settlement_offer);

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
    paymentReference
  ] = escrow;

  const [splitBuyer, splitSeller, splitMarketplace, splitProtocol] =
    bipsToPercentage(splits);

  const [consensusBuyer, consensusSeller] = consensus;

  const marketplace: string | null = nullOrValue(_marketplace);
  const marketplaceFee = bipsToPercentage([_marketplaceFee.toString()])[0];
  const tokenAddress: string | null = nullOrValue(currency);

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    settledAt: toDate(approved_at),
    escrowId: Number(escrow_id),
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
    latestSettlementOfferBuyer: lsoBuyer,
    latestSettlementOfferSeller: lsoSeller,
  };
};
