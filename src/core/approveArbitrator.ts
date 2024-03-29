import { UnicrowArbitrator__factory } from "@unicrowio/ethers-types";

import { getContractAddress } from "../config";
import {
  ApproveArbitratorParsedPayload,
  IApproveArbitrationTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import {
  getWeb3Provider,
  autoSwitchNetwork,
  getCurrentWalletAddress,
} from "../wallet";
import { percentageToBips } from "../helpers";
import { parseApproveArbitrator } from "./internal/parsers/eventApproveArbitrator";

/**
 * Approves an arbitrator proposed by the other party (i.e. by seller if buyer proposed, by buyer if seller proposed).
 * To ensure both agree to the same arbitrator and arbitrator fee, these parameters are included in the proposal.
 *
 * @param escrowId - ID of the escrow
 * @param arbitrator - Arbitrator address
 * @param arbitratorFee - Arbitrator fee in %
 * @returns Info about the approved arbitration
 */
export const approveArbitrator = async (
  escrowId: number,
  arbitrator: string,
  arbitratorFee: number,
  callbacks?: IApproveArbitrationTransactionCallbacks,
): Promise<ApproveArbitratorParsedPayload> => {
  try {
    callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
    const provider = await getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Approving the Arbiter. Account not connected");
    }

    await autoSwitchNetwork(callbacks);

    const walletAddress = await getCurrentWalletAddress();
    callbacks && callbacks.connected && callbacks.connected(walletAddress);

    const crowArbitratorContract = UnicrowArbitrator__factory.connect(
      getContractAddress("arbitrator"),
      await provider.getSigner(),
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

    const parsedPayload = parseApproveArbitrator(receiptTx.logs);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
