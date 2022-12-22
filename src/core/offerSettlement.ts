import { UnicrowDispute__factory } from "@unicrowio/ethers-types";

import { getContractAddress } from "../config";
import {
	ISettlementOfferTransactionCallbacks,
	OfferSettlementParsedPayload,
} from "../typing";
import { errorHandler } from "./errorHandler";
import { autoSwitchNetwork, getWeb3Provider } from "../wallet";
import { parseOfferSettlement } from "parsers/eventOfferSettlement";

/**
 * Sends an offer to settle the payment arbitrarily between the buyer and the seller. The other party must confirm
 * the settlement in order for it to be executed.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<OfferSettlementParsedPayload>}
 */
export const offerSettlement = async (
	escrowId: number,
	splitBuyer: number,
	splitSeller: number,
	callbacks?: ISettlementOfferTransactionCallbacks,
): Promise<OfferSettlementParsedPayload> => {
	try {
		callbacks.connectingWallet?.();
		const provider = await getWeb3Provider();

		if (!provider) {
			throw new Error("Error on Settlement, Account Not connected");
		}

		await autoSwitchNetwork(callbacks);

		const crowDisputeContract = UnicrowDispute__factory.connect(
			getContractAddress("dispute"),
			provider.getSigner(),
		);

		callbacks.broadcasting?.();
		const settlementTx = await crowDisputeContract.offerSettlement(escrowId, [
			splitBuyer * 100,
			splitSeller * 100,
		]);

		callbacks.broadcasted?.({
			transactionHash: settlementTx.hash,
			splitBuyer,
			splitSeller,
		});

		const receiptTx = await settlementTx.wait();

		const parsedPayload = parseOfferSettlement(receiptTx.events);

		callbacks.confirmed?.(parsedPayload);

		return parsedPayload;
	} catch (error) {
		const errorMessage = errorHandler(error);
		throw new Error(errorMessage);
	}
};
