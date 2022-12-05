//  Helpers functions to parser event SDK

type Event =
  | 'SingleClaim'
  | 'Pay'
  | 'Release'
  | 'Refund'
  | 'Claim'
  | 'Challenge'
  | 'ArbitratorProposed'
  | 'ArbitratorApproved'
  | 'Arbitrated'
  | 'SettlementOffer'
  | 'ApproveOffer'

export const getEventByName = (name: Event, events: any[]) => {
  return events.find(event => event.event === name)
}
