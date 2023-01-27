import { Unicrow__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import { IReleaseTransactionCallbacks, ReleaseParsedPayload } from "../typing";
import { autoSwitchNetwork, getWeb3Provider } from "../wallet";
import { errorHandler } from "./internal/errorHandler";
import { parseRelease } from "./internal/parsers/eventRelease";

/**
 * Release the escrow to the seller and to all other parties that charge a fee from it.
 *
 * @throws If account is not connected or if called in invalid state (e.g. already claimed / not called by the buyer)
 * @returns Payload with all info about the escrow, including how much was sent to whom (incl. fees)
 */
export const release = async (
  escrowId: number,
  callbacks?: IReleaseTransactionCallbacks,
): Promise<ReleaseParsedPayload> => {
  callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
  const provider = await getWeb3Provider();

  if (!provider) {
    throw new Error("Error on Release, Account Not connected");
  }

  await autoSwitchNetwork(callbacks);

  callbacks && callbacks.connected && callbacks.connected();

  const Unicrow = Unicrow__factory.connect(
    getContractAddress("unicrow"),
    provider.getSigner(),
  );

  try {
    // FIX-ME: No need to get signer if the contract reference is initialized globally
    callbacks && callbacks.broadcasting && callbacks.broadcasting();
    const releaseTx = await Unicrow.release(escrowId);

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: releaseTx.hash,
      });

    const receiptTx = await releaseTx.wait();

    const parsedPayloadReleased = parseRelease(receiptTx.events);

    callbacks &&
      callbacks.confirmed &&
      callbacks.confirmed(parsedPayloadReleased);

    return parsedPayloadReleased;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
