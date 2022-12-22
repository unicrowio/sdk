import { getContractAddress } from "../config";
import { UnicrowClaim__factory } from "@unicrowio/ethers-types";
import { IClaimTransactionCallbacks, ClaimParsedPayload } from "../typing";
import { getWeb3Provider, autoSwitchNetwork } from "../wallet";
import { errorHandler } from "./errorHandler";
import { parseClaim } from "parsers/eventClaim";

/**
 * Claims a single payment from the escrow. To save everyone's gas costs, it claims balances and fees
 * of all parties that are eligible for a share from the escrow.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ClaimParsedPayload>}
 */
export const claim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks,
): Promise<ClaimParsedPayload> => {
  callbacks.connectingWallet?.();
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
    const claimTx = await smartContract.claim(escrowId);
    callbacks.broadcasting?.();

    callbacks.broadcasted?.({
      transactionHash: claimTx.hash,
    });

    const receiptTx = await claimTx.wait();

    const parsedPayload = parseClaim(receiptTx.events);

    callbacks.confirmed?.(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
