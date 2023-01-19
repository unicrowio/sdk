import { UnicrowArbitrator__factory } from "@unicrowio/ethers-types";

import { getContractAddress } from "../config";
import {
  ApproveArbitratorParsedPayload,
  IArbitrationTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import { getWeb3Provider, autoSwitchNetwork } from "../wallet";
import { percentageToBips } from "../helpers";
import { parseApproveArbitrator } from "./internal/parsers/eventApproveArbitrator";

/**
 * Approves an arbitrator proposed by the other party (i.e. by seller if buyer proposed, by buyer if seller proposed).
 * To ensure both agree to the same arbitrator and arbitrator fee, these parameters are included in the proposal.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ApproveArbitratorParsedPayload>}
 */
export const approveArbitrator = async (
  escrowId: number,
  arbitrator: string,
  arbitratorFee: number,
  callbacks?: IArbitrationTransactionCallbacks,
): Promise<ApproveArbitratorParsedPayload> => {
  try {
    callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
    const provider = await getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Approving the Arbiter. Account not connected");
    }

    await autoSwitchNetwork(callbacks);

    const crowArbitratorContract = UnicrowArbitrator__factory.connect(
      getContractAddress("arbitrator"),
      provider.getSigner(),
    );

    callbacks && callbacks.broadcasting && callbacks.broadcasting();

    const approveArbiterTx = await crowArbitratorContract.approveArbitrator(
      escrowId,
      arbitrator,
      percentageToBips([arbitratorFee])[0],
    );

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: approveArbiterTx.hash,
        arbitrator,
        arbitratorFee,
      });

    const receiptTx = await approveArbiterTx.wait();

    const parsedPayload = parseApproveArbitrator(receiptTx.events);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
