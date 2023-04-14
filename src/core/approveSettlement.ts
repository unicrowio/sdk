import { UnicrowDispute__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import {
  ApproveSettlementParsedPayload,
  ISettlementApproveTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./internal/errorHandler";
import {
  getWeb3Provider,
  autoSwitchNetwork,
  getCurrentWalletAddress,
} from "../wallet";
import { parseApproveSettlement } from "./internal/parsers/eventApproveSettlement";

/**
 * Approves an offer to settle the payment between the buyer and the seller.
 * To check that the user is really approving the right offer (i.e. to prevent on-chain front-running),
 *   the same offer parameters must be provided.
 *
 * @param escrowId - ID of the escrow
 * @param splitBuyer - Share (%) of the escrow offered to the buyer
 * @param splitSeller - Share (%) of the escrow offered to the seller (buyer+seller must equal 100)
 *
 * @returns Info about the approved offer
 */
export const approveSettlement = async (
  escrowId: number,
  splitBuyer: number,
  splitSeller: number,
  callbacks?: ISettlementApproveTransactionCallbacks,
): Promise<ApproveSettlementParsedPayload> => {
  try {
    callbacks && callbacks.connectingWallet && callbacks.connectingWallet();
    const provider = await getWeb3Provider();

    if (!provider) {
      throw new Error("Error on Approve Offer, Account Not connected");
    }

    await autoSwitchNetwork(callbacks);

    const walletAddress = await getCurrentWalletAddress();
    callbacks && callbacks.connected && callbacks.connected(walletAddress);

    const CrowDisputeContract = UnicrowDispute__factory.connect(
      getContractAddress("dispute"),
      await provider.getSigner(),
    );
    const approveOfferTx = await CrowDisputeContract.approveSettlement(
      escrowId,
      [splitBuyer * 100, splitSeller * 100],
    );

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: approveOfferTx.hash,
        splitBuyer,
        splitSeller,
      });

    const receiptTx = await approveOfferTx.wait();

    const parsedPayload = parseApproveSettlement(receiptTx.logs);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
