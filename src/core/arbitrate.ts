import { UnicrowArbitrator__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import {
  ArbitrateParsedPayload,
  IArbitrationTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import { autoSwitchNetwork, getWeb3Provider } from "../wallet";
import { parseArbitrate } from "./internal/parsers/eventArbitrate";

/**
 * Action performed by the previously defined/agreed on arbitrator.
 *
 * @async
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ArbitrateParsedPayload>}
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
