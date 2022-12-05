import { OfferSettlementParsedPayload } from '../typing'
import { bipsToPercentage, toDate } from '../helpers'
import { getEventByName } from './common'

export const parseOfferSettlement = (
  events: any[]
): OfferSettlementParsedPayload => {
  const _event = getEventByName('SettlementOffer', events)

  const [
    escrow_id,
    settlement_offer_at,
    latest_settlement_offer,
    latest_settlement_offer_address
  ] = _event.args

  const [lsoBuyer, lsoSeller] = bipsToPercentage(latest_settlement_offer)

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    settlementOfferAt: toDate(settlement_offer_at),
    escrowId: escrow_id.toNumber(),
    latestSettlementOfferAddress: latest_settlement_offer_address.toString(),
    latestSettlementOfferBuyer: lsoBuyer,
    latestSettlementOfferSeller: lsoSeller
  }
}
