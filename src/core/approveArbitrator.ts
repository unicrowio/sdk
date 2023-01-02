import { UnicrowArbitrator__factory } from "@unicrowio/ethers-types";

import { getContractAddress } from "../config";
import {
  ApproveArbitratorParsedPayload,
  IArbitrationTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./errorHandler";
import { getWeb3Provider, autoSwitchNetwork } from "../wallet";
import { percentageToBips } from "../helpers";
import { parseApproveArbitrator } from "parsers/eventApproveArbitrator";

/**
 * Approves an arbitrator proposed by another party (i.e. by seller if buyer proposed, by buyer if seller proposed).
 * To ensure the user approves an arbitrator they wanted, it requires the same parameters as proposal
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
    callbacks && callbacks.connectingWallet && callbacks.connectingWallet()
    const provider = await getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Approving the Arbiter. Account not connected");
    }

    await autoSwitchNetwork(callbacks);

    const crowArbitratorContract = UnicrowArbitrator__factory.connect(
      getContractAddress("arbitrator"),
      provider.getSigner(),
    );

    callbacks && callbacks.broadcasting && callbacks.broadcasting()

    const approveArbiterTx = await crowArbitratorContract.approveArbitrator(
      escrowId,
      arbitrator,
      percentageToBips([arbitratorFee])[0],
    );

    callbacks.broadcasted?.({
      transactionHash: approveArbiterTx.hash,
      arbitrator,
      arbitratorFee,
    });

    const receiptTx = await approveArbiterTx.wait();

    const parsedPayload = parseApproveArbitrator(receiptTx.events);

    callbacks.confirmed?.(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
