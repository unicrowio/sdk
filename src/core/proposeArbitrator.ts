import { UnicrowArbitrator__factory } from "@unicrowio/ethers-types";
import { getContractsAddresses } from "../config";
import {
  IProposeArbitrationTransactionCallbacks,
  ProposalArbitratorParsedPayload,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import { autoSwitchNetwork, getWeb3Provider } from "../wallet";
import { validateAddresses } from "../helpers";
import { parseProposalArbitrator } from "./internal/parsers/eventProposalArbitrator";

/**
 * One of the parties (buyer or seller) can call this to propose an arbitrator
 * for an escrow that has no arbitrator defined.
 *
 * @param escrowId - Id of an escrow for which the arbitrator is being proposed
 * @param arbitrator - Arbitrator's address
 * @param arbitratorFee - Arbitrator's fee in % (can be 0)
 * @param callbacks - Pass code to any of these to be executed when the respective step takes place in the wallet
 * @returns Info about the proposed arbitrator, his fee and who proposed it
 */
export const proposeArbitrator = async (
  escrowId: number,
  arbitrator: string,
  arbitratorFee: number,
  callbacks?: IProposeArbitrationTransactionCallbacks,
): Promise<ProposalArbitratorParsedPayload> => {
  try {
    validateAddresses({ arbitrator });

    callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
    const provider = getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Adding Arbitrator. Account not connected");
    }

    await autoSwitchNetwork(callbacks);

    const crowArbitratorContract = UnicrowArbitrator__factory.connect(
      (await getContractsAddresses()).arbitrator,
      await provider.getSigner(),
    );

    callbacks && callbacks.broadcasting && callbacks.broadcasting();
    const proposeArbitratorTx = await crowArbitratorContract.proposeArbitrator(
      escrowId,
      arbitrator,
      arbitratorFee * 100,
    );

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: proposeArbitratorTx.hash,
        arbitrator,
        arbitratorFee,
      });

    const receiptTx = await proposeArbitratorTx.wait();

    const parsedPayload = parseProposalArbitrator(receiptTx.logs);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
