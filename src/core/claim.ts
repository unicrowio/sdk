import { getContractAddress } from "../config";
import { UnicrowClaim__factory } from "@unicrowio/ethers-types";
import { IClaimTransactionCallbacks, ClaimParsedPayload } from "../typing";
import { getWeb3Provider, autoSwitchNetwork } from "../wallet";
import { errorHandler } from "./internal/errorHandler";
import { parseClaim } from "./internal/parsers/eventClaim";

/**
 * Claims a share from the escrow. To save everyone's gas costs, it claims balances and fees
 * for all parties that are eligible for it.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ClaimParsedPayload>} array with all info about the claim (amounts per party)
 */
export const claim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks,
): Promise<ClaimParsedPayload> => {
  callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
  const provider = await getWeb3Provider();

  if (!provider) {
    throw new Error("Error on Claiming, Account Not connected");
  }

  await autoSwitchNetwork(callbacks);

  callbacks && callbacks.connected && callbacks.connected();

  const smartContract = UnicrowClaim__factory.connect(
    getContractAddress("claim"),
    provider.getSigner(),
  );

  try {
    const claimTx = await smartContract.claim(escrowId);
    callbacks && callbacks.broadcasting && callbacks.broadcasting();

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: claimTx.hash,
      });

    const receiptTx = await claimTx.wait();

    const parsedPayload = parseClaim(receiptTx.events);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
