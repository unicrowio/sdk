import { getContractsAddresses } from "../config";
import { UnicrowClaim__factory } from "@unicrowio/ethers-types";
import { IClaimTransactionCallbacks, ClaimParsedPayload } from "../typing";
import {
  getWeb3Provider,
  autoSwitchNetwork,
  getCurrentWalletAddress,
} from "../wallet";
import { errorHandler } from "./internal/errorHandler";
import { parseClaim } from "./internal/parsers/eventClaim";

/**
 * Claims a share from the escrow. To save everyone's gas costs, it claims balances and fees
 * for all parties that are eligible for it.
 *
 * @param escrowId - ID of the escrow to claim
 * @returns Claimed amounts (in token's or ETH's WEI) per party)
 */
export const claim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks,
): Promise<ClaimParsedPayload> => {
  callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
  const provider = getWeb3Provider();

  if (!provider) {
    throw new Error("Error on Claiming, Account Not connected");
  }

  await autoSwitchNetwork(callbacks);

  const walletAddress = await getCurrentWalletAddress();
  callbacks && callbacks.connected && callbacks.connected(walletAddress);

  const smartContract = UnicrowClaim__factory.connect(
    (await getContractsAddresses()).claim,
    await provider.getSigner(),
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

    const parsedPayload = parseClaim(receiptTx.logs);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
