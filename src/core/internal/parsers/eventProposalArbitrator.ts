import { bipsToPercentage } from "../../../helpers";
import { ProposalArbitratorParsedPayload } from "../../../typing";
import { getEventByName } from "./common";

export const parseProposalArbitrator = (
  events: any[],
): ProposalArbitratorParsedPayload => {
  const _event = getEventByName("ArbitratorProposed", events);

  const [escrowId, arbitrator, arbitratorFee, proposer] = _event.args;

  const [arbitrator_fee] = bipsToPercentage([arbitratorFee]);

  return {
    name: _event.event,
    transactionHash: _event.transactionHash,
    blockNumber: _event.blockNumber,
    escrowId: escrowId.toNumber(),
    arbitrator,
    arbitratorFee: arbitrator_fee,
    proposer,
    statusArbitration: "ArbitratorProposed",
  };
};
