import { bipsToPercentage, toDate } from '../helpers'
import { ArbitrateParsedPayload } from '../typing'
import { getEventByName } from './common'

export const parseArbitrate = (events: any[]): ArbitrateParsedPayload => {
  const _event = getEventByName('Arbitrated', events)

  const [escrowId, escrow, settled_at, amounts] = _event.args

  const [
    buyer,
    challengeExtension,
    seller,
    challengePeriodStart,
    marketplace,
    marketplaceFee,
    challengePeriodEnd,
    currency,
    claimed,
    consensus,
    splits,
    amount
  ] = escrow

  const [splitBuyer, splitSeller, splitMarketplace, splitProtocol] =
    bipsToPercentage(splits)

  const [consensusBuyer, consensusSeller] = consensus

  const [
    amount_buyer,
    amount_seller,
    amount_marketplace,
    amount_protocol,
    amount_arbitrator
  ] = amounts

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    escrowId: escrowId.toNumber(),
    settledAt: toDate(settled_at),
    buyer: buyer.toString(),
    seller: seller.toString(),
    challengePeriodExtension: Number(challengeExtension?.toString()),
    challengePeriodStart: toDate(challengePeriodStart),
    challengePeriodEnd: toDate(challengePeriodEnd),
    marketplace: marketplace.toString(),
    marketplaceFee: bipsToPercentage([marketplaceFee.toString()])[0],
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
    amountArbitrator: amount_arbitrator.toString()
  }
}
