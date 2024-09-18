import { ClaimParsedPayload } from "../../../typing";
import { getEventByName } from "./common";

export const parseClaim = (events: any[]): ClaimParsedPayload => {
  const _event = getEventByName("Claim", events);
  const [escrow_id, payments] = _event.args[0];
  const [
    amount_buyer,
    amount_seller,
    amount_marketplace,
    amount_protocol,
    amount_arbitrator,
  ] = payments;

  return {
    name: _event.fragment.name,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    escrowId: Number(escrow_id),
    amountBuyer: amount_buyer.toString(),
    amountSeller: amount_seller.toString(),
    amountMarketplace: amount_marketplace.toString(),
    amountProtocol: amount_protocol.toString(),
    amountArbitrator: amount_arbitrator.toString(),
  };
};
