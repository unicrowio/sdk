import { Unicrow__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import { IReleaseTransactionCallbacks, ReleaseParsedPayload } from "../typing";
import { autoSwitchNetwork, getWeb3Provider } from "../wallet";
import { errorHandler } from "./errorHandler";
import { parseRelease } from "parsers/eventRelease";

/**
 * Release the escrow to the seller and to all other parties that charge a fee from it.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if called in invalid state (e.g. already claimed / not called by seller)
 * @returns {Promise<ReleaseParsedPayload>}
 */
export const release = async (
	escrowId: number,
	callbacks?: IReleaseTransactionCallbacks,
): Promise<ReleaseParsedPayload> => {
	callbacks.connectingWallet?.();
	const provider = await getWeb3Provider();

	if (!provider) {
		throw new Error("Error on Release, Account Not connected");
	}

	await autoSwitchNetwork(callbacks);

	callbacks.connected?.();

	const Unicrow = Unicrow__factory.connect(
		getContractAddress("unicrow"),
		provider.getSigner(),
	);

	try {
		// FIX-ME: No need to get signer if the contract reference is initialized globally
		callbacks.broadcasting?.();
		const releaseTx = await Unicrow.release(escrowId);

		callbacks.broadcasted?.({
			transactionHash: releaseTx.hash,
		});

		const receiptTx = await releaseTx.wait();

		const parsedPayloadReleased = parseRelease(receiptTx.events);

		callbacks.confirmed?.(parsedPayloadReleased);

		return parsedPayloadReleased;
	} catch (error) {
		const errorMessage = errorHandler(error);
		throw new Error(errorMessage);
	}
};
