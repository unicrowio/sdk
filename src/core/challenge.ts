import { UnicrowDispute__factory } from "@unicrowio/ethers-types";

import {
  autoSwitchNetwork,
  getWalletAccount,
  getWeb3Provider,
} from "../wallet";
import { getContractAddress } from "../config";
import {
  ChallengeParsedPayload,
  IChallengeTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import { parseChallenge } from "./internal/parsers/eventChallenge";

/**
 * Sends a challenge and returns the escrow data.
 *
 * @param escrowId - Escrow ID
 * @returns Escrow data after the challenge
 */
export const challenge = async (
  escrowId: number,
  callbacks?: IChallengeTransactionCallbacks,
): Promise<ChallengeParsedPayload> => {
  callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
  const provider = await getWeb3Provider();

  if (!provider) {
    throw new Error("Error on Challenge, Account Not connected");
  }

  await autoSwitchNetwork(callbacks);

  try {
    const walletAddress = await getWalletAccount();
    callbacks && callbacks.connected && callbacks.connected(walletAddress);
    const smartContract = UnicrowDispute__factory.connect(
      getContractAddress("dispute"),
      provider.getSigner(),
    );

    callbacks && callbacks.broadcasting && callbacks.broadcasting();
    const challengeTx = await smartContract.challenge(escrowId);

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: challengeTx.hash,
      });

    const receiptTx = await challengeTx.wait();

    const parsedPayload = parseChallenge(receiptTx);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
