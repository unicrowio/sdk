import { PayParsedPayload } from "../../../typing";
import { bipsToPercentage, toDate, nullOrValue } from "../../../helpers";
import { getEventByName } from "./common";
import { calculateAmounts } from "../..";

export const parsePay = (events: any[]): PayParsedPayload => {
  const _event = getEventByName("Pay", events);

  const [
    escrow_id,
    paid_at,
    escrow,
    _arbitrator,
    _arbitrator_fee,
    challenge_period,
  ] = _event.args;

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

  // parsers
  const arbitrator: string | null = nullOrValue(_arbitrator);
  const marketplace: string | null = nullOrValue(_marketplace);
  const tokenAddress: string | null = nullOrValue(currency);

  const arbitratorFee = arbitrator
    ? bipsToPercentage([_arbitrator_fee.toNumber()])[0]
    : 0;

  const marketplaceFee = bipsToPercentage([_marketplaceFee.toString()])[0];

  const [splitBuyer, splitSeller, splitMarketplace, splitProtocol] =
    bipsToPercentage(splits);

  const {
    amountBuyer,
    amountSeller,
    amountProtocol,
    amountMarketplace,
    amountArbitrator,
  } = calculateAmounts(
    {
      amount: Number(amount.toString()),
      splitBuyer,
      splitSeller,
      splitProtocol,
      splitMarketplace,
      arbitratorFee,
    },
    false,
  );

  const [consensusBuyer, consensusSeller] = consensus;

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    paidAt: toDate(paid_at),
    escrowId: escrow_id.toNumber(),
    arbitrator,
    arbitratorFee,
    buyer: buyer.toString(),
    seller: seller.toString(),
    challengePeriod: Number(challenge_period?.toString()),
    challengePeriodExtension: Number(challengeExtension?.toString()),
    challengePeriodStart: toDate(challengePeriodStart),
    challengePeriodEnd: toDate(challengePeriodEnd),
    marketplace,
    marketplaceFee,
    tokenAddress,
    claimed: !!claimed,
    consensusBuyer,
    consensusSeller,
    splitBuyer,
    splitSeller,
    splitMarketplace,
    splitProtocol,
    amount: amount.toString(),
    amountBuyer: String(amountBuyer),
    amountSeller: String(amountSeller),
    amountMarketplace: String(amountMarketplace),
    amountArbitrator: String(amountArbitrator),
    amountProtocol: String(amountProtocol),
  };
};