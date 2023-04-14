import { UnicrowDispute__factory } from "@unicrowio/ethers-types";

import { getContractAddress } from "../config";
import {
  ISettlementOfferTransactionCallbacks,
  OfferSettlementParsedPayload,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import {
  autoSwitchNetwork,
  getCurrentWalletAddress,
  getWeb3Provider,
} from "../wallet";
import { parseOfferSettlement } from "./internal/parsers/eventOfferSettlement";

/**
 * Sends an offer to settle the payment arbitrarily between the buyer and the seller. The other party must confirm
 * the settlement in order for it to be executed.
 *
 * @param escrowId - Id of the escrow
 * @param splitBuyer - Split offered to the buyer (%)
 * @param splitSeller - Split offered to the seller (%)
 * @returns The percentages of the payment split between the buyer and seller, by who it was offered and when
 */
export const offerSettlement = async (
  escrowId: number,
  splitBuyer: number,
  splitSeller: number,
  callbacks?: ISettlementOfferTransactionCallbacks,
): Promise<OfferSettlementParsedPayload> => {
  try {
    callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
    const provider = await getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Settlement, Account Not connected");
    }

    await autoSwitchNetwork(callbacks);

    const walletAddress = await getCurrentWalletAddress();
    callbacks && callbacks.connected && callbacks.connected(walletAddress);

    const crowDisputeContract = UnicrowDispute__factory.connect(
      getContractAddress("dispute"),
      await provider.getSigner(),
    );

    callbacks && callbacks.broadcasting && callbacks.broadcasting();
    const settlementTx = await crowDisputeContract.offerSettlement(escrowId, [
      splitBuyer * 100,
      splitSeller * 100,
    ]);

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: settlementTx.hash,
        splitBuyer,
        splitSeller,
      });

    const receiptTx = await settlementTx.wait();

    const parsedPayload = parseOfferSettlement(receiptTx.logs);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
