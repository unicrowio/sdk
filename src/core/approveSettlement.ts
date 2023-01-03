import { UnicrowDispute__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import {
  ApproveSettlementParsedPayload,
  ISettlementApproveTransactionCallbacks,
} from "../typing";
import { errorHandler } from "./errorHandler";
import { getWeb3Provider, autoSwitchNetwork } from "../wallet";
import { parseApproveSettlement } from "parsers/eventApproveSettlement";

/**
 * Sends an offer to settle the payment between the buyer and the seller.
 *

     * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ApproveSettlementParsedPayload>}
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

    const CrowDisputeContract = UnicrowDispute__factory.connect(
      getContractAddress("dispute"),
      provider.getSigner(),
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

    const parsedPayload = parseApproveSettlement(receiptTx.events);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
