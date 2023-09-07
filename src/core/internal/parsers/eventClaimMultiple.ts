import {
  ClaimParsedPayload,
  MultipleClaimParsedPayload,
} from "../../../typing";
import { getEventByName } from "./common";

export const parseMultipleClaim = (
  events: any[],
): MultipleClaimParsedPayload => {
  const _event = getEventByName("ClaimMultiple", events);
  const parsedClaim = _event.args[0].map((item: any) => {
    const [escrow_id, payments] = item;
    const [
      amount_buyer,
      amount_seller,
      amount_marketplace,
      amount_protocol,
      amount_arbitrator,
    ] = payments;

    return {
      name: _event.event,
      transactionHash: _event.transactionHash,
      blockNumber: _event.blockNumber,
      escrowId: Number(escrow_id),
      amountBuyer: amount_buyer.toString(),
      amountSeller: amount_seller.toString(),
      amountMarketplace: amount_marketplace.toString(),
      amountProtocol: amount_protocol.toString(),
      amountArbitrator: amount_arbitrator.toString(),
    } as ClaimParsedPayload;
  });

  return parsedClaim as MultipleClaimParsedPayload;
};
