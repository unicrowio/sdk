import { getContractAddress } from "../config";
import { Unicrow__factory } from "@unicrowio/ethers-types";
import { IRefundTransactionCallbacks } from "../typing";
import {
  autoSwitchNetwork,
  getWalletAccount,
  getWeb3Provider,
} from "../wallet";
import { errorHandler } from "./internal/errorHandler";

/**
 * Refunds 100% of the buyer payment (all fees are waived), returns transactions' hash.
 * Can only be called by the seller.
 *
 * @param escrowId - ID of the escrow to refund
 * @throws Error if account is not connected or if called in an invalid state (e.g. already claimed / not called by seller)
 * @returns transaction hash
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

  const walletAddress = await provider.getSigner().getAddress();
  callbacks && callbacks.connected && callbacks.connected(walletAddress);

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

    callbacks &&
      callbacks.confirmed &&
      callbacks.confirmed({
        transactionHash: refundTx.hash,
      });

    return refundTx.hash;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
