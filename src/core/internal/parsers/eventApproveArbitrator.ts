import { bipsToPercentage } from "../../../helpers";
import { ApproveArbitratorParsedPayload } from "../../../typing";
import { getEventByName } from "./common";

export const parseApproveArbitrator = (
  events: any[],
): ApproveArbitratorParsedPayload => {
  const proposalEvent = getEventByName("ArbitratorApproved", events);

  const [escrowId, arbitrator, arbitratorFee] = proposalEvent.args;

  const [arbitrator_fee] = bipsToPercentage([arbitratorFee]);

  return {
    name: proposalEvent.fragment.name,
    transactionHash: proposalEvent.transactionHash,
    blockNumber: proposalEvent.blockNumber,
    escrowId: Number(escrowId),
    arbitrator,
    arbitratorFee: arbitrator_fee,
    statusArbitration: "ArbitratorApproved",
  };
};
