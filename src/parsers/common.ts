//  Helpers functions to parser event SDK

type Event =
  | "Claim"
  | "Pay"
  | "Release"
  | "Refund"
  | "ClaimMultiple"
  | "Challenge"
  | "ArbitratorProposed"
  | "ArbitratorApproved"
  | "Arbitrated"
  | "SettlementOffer"
  | "ApproveOffer";

export const getEventByName = (name: Event, events: any[]) => {
  return events.find((event) => event.event === name);
};
