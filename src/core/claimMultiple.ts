import { getContractAddress } from "../config";
import { UnicrowClaim__factory } from "@unicrowio/ethers-types";
import {
  MultipleClaimParsedPayload,
  IClaimTransactionCallbacks,
} from "../typing";
import { getWeb3Provider, autoSwitchNetwork } from "../wallet";
import { errorHandler } from "./errorHandler";
import { parseMultipleClaim } from "parsers/eventClaimMultiple";

/**
 * Claim multiple escrow payments at the same time. To save everyone's gas costs, it claims balances and fees
 * of all parties that are eligible for a share from the escrow. The contract will check if each of the provided
 * escrows are indeed claimable and if not, will revert the transaction and return an error.
 * {@link indexer.getClaimableEscrow()} provides an easy way to get a predigested list for this function.
 * The gas cost of this grows almost linearly with each additional escrow, therefore this function will set an
 * appropriate gas limit if necessary.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<MultipleClaimParsedPayload>}
 */
export const claimMultiple = async (
  escrowIds: number[],
  callbacks?: IClaimTransactionCallbacks,
): Promise<MultipleClaimParsedPayload> => {
  callbacks && callbacks.connectingWallet && callbacks.connectingWallet()
  const provider = await getWeb3Provider();

  if (!provider) {
    throw new Error("Error on Claiming, Account Not connected");
  }

  await autoSwitchNetwork(callbacks);

  callbacks.connected?.();

  const smartContract = UnicrowClaim__factory.connect(
    getContractAddress("claim"),
    provider.getSigner(),
  );

  try {
    // FIX-ME: No need to get signer if the contract reference is initialized globally
    const claimTx = await smartContract.claimMultiple(escrowIds);
    callbacks && callbacks.broadcasting && callbacks.broadcasting()

    callbacks.broadcasted?.({
      transactionHash: claimTx.hash,
    });

    const receiptTx = await claimTx.wait();

    const parsedPayload = parseMultipleClaim(receiptTx.events);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload)

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
