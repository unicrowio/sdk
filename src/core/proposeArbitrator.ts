import { UnicrowArbitrator__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import {
  IArbitrationTransactionCallbacks,
  ProposalArbitratorParsedPayload,
} from "../typing";
import { errorHandler } from "./errorHandler";
import { autoSwitchNetwork, getWeb3Provider } from "../wallet";
import { validateAddress } from "../helpers/validateAddress";
import { parseProposalArbitrator } from "parsers/eventProposalArbitrator";

/**
 * One of the parties (buyer or seller) can call this to propose an arbitrator
 * for an escrow that has no arbitrator defined.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ProposalArbitratorParsedPayload>}
 */
export const proposeArbitrator = async (
  escrowId: number,
  arbitrator: string,
  arbitratorFee: number,
  callbacks?: IArbitrationTransactionCallbacks,
): Promise<ProposalArbitratorParsedPayload> => {
  try {
    validateAddress({ arbitrator });

    callbacks && callbacks.connectingWallet && callbacks.connectingWallet()
    const provider = await getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Adding Arbitrator. Account not connected");
    }

    await autoSwitchNetwork(callbacks);

    const crowArbitratorContract = UnicrowArbitrator__factory.connect(
      getContractAddress("arbitrator"),
      provider.getSigner(),
    );

    callbacks && callbacks.broadcasting && callbacks.broadcasting()
    const proposeArbitratorTx = await crowArbitratorContract.proposeArbitrator(
      escrowId,
      arbitrator,
      arbitratorFee * 100,
    );

    callbacks.broadcasted?.({
      transactionHash: proposeArbitratorTx.hash,
      arbitrator,
      arbitratorFee,
    });

    const receiptTx = await proposeArbitratorTx.wait();

    const parsedPayload = parseProposalArbitrator(receiptTx.events);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload)

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
