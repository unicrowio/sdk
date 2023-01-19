import { getContractAddress } from "../config";
import { Unicrow__factory } from "@unicrowio/ethers-types";
import { IRefundTransactionCallbacks } from "../typing";
import { autoSwitchNetwork, getWeb3Provider } from "../wallet";
import { errorHandler } from "./internal/errorHandler";

/**
 * Refunds 100% of the buyer payment (all fees are waived), returns its transaction hash.
 *
 * @privateRemarks Can only be called by the seller.
 * @throws Error
 * If account is not connected (=no provider given) or if called in invalid state (e.g. already claimed / not called by seller)
 * @returns {Promise<string>} the hash of the transaction
 */
export const refund = async (
  escrowId: number,
  callbacks?: IRefundTransactionCallbacks,
): Promise<string> => {
  callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
  const provider = await getWeb3Provider();

  if (!provider) {
    throw new Error("Error on Refund, Account Not connected");
  }

  await autoSwitchNetwork(callbacks);

  callbacks && callbacks.connected && callbacks.connected();

  const smartContract = Unicrow__factory.connect(
    getContractAddress("unicrow"),
    provider.getSigner(),
  );

  try {
    const refundTx = await smartContract.refund(escrowId);
    callbacks && callbacks.broadcasting && callbacks.broadcasting();
    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: refundTx.hash,
      });

    await refundTx.wait();

    callbacks.confirmed?.({
      transactionHash: refundTx.hash,
    });

    return refundTx.hash;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
