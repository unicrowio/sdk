import { UnicrowArbitrator__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import {
  ArbitrateParsedPayload,
  IArbitrationTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import {
  autoSwitchNetwork,
  getCurrentWalletAddress,
  getWeb3Provider,
} from "../wallet";
import { parseArbitrate } from "./internal/parsers/eventArbitrate";

/**
 * Previously defined/agreed on arbitrator uses this to arbitrate the payment
 *
 * @param escrowId - ID of the escrow to arbitrate
 * @param splitBuyer - What share of the escrow should go to the buyer (0 for release, 100 for refund)
 * @param splitSeller - What share of the escrow should go to the seller (buyer + seller must equal 100)
 *
 * @returns Info about the arbitration
 */
export const arbitrate = async (
  escrowId: number,
  splitBuyer: number,
  splitSeller: number,
  callbacks?: IArbitrationTransactionCallbacks,
): Promise<ArbitrateParsedPayload> => {
  try {
    callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
    const provider = await getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Arbitrating. Account not connected");
    }

    await autoSwitchNetwork(callbacks);

    const walletAddress = await getCurrentWalletAddress();
    callbacks && callbacks.connected && callbacks.connected(walletAddress);

    const crowArbitratorContract = UnicrowArbitrator__factory.connect(
      getContractAddress("arbitrator"),
      provider.getSigner(),
    );

    callbacks && callbacks.broadcasting && callbacks.broadcasting();

    // the order matters split_ [buyer, seller]
    const arbitrateTx = await crowArbitratorContract.arbitrate(escrowId, [
      splitBuyer * 100,
      splitSeller * 100,
    ]);

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: arbitrateTx.hash,
        splitBuyer,
        splitSeller,
      });

    const receiptTx = await arbitrateTx.wait();

    const parsedPayload = parseArbitrate(receiptTx.events);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
