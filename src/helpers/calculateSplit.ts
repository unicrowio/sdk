import BigNumber from "bignumber.js";
import { calculateAmounts } from "../core";
import { EscrowStatusView } from "../typing";
import { isSameAddress } from "./isSameAddress";

interface IGetSplitFromLoggedUser {
	amount: BigNumber;
	split_protocol: number;
	split_buyer: number;
	split_seller: number;
	split_marketplace: number;
	buyer: string;
	seller: string;
	marketplace: string | null;
	arbitrator_fee?: number;
	arbitrated: boolean;
}

// Get buyer or seller split based on logged in user participation
export const getSplitFromLoggedUser = (
	current: IGetSplitFromLoggedUser,
	walletUserAddress: string,
) => {
	const isSettledByArbitrator = current.arbitrated;

	const { amountBuyer, amountSeller, amountArbitrator, amountMarketplace } =
		calculateAmounts(
			{
				amount: new BigNumber(current.amount).toNumber(),
				splitBuyer: current.split_buyer,
				splitSeller: current.split_seller,
				splitProtocol: current.split_protocol,
				splitMarketplace: current.split_marketplace,
				arbitratorFee: current.arbitrator_fee,
			},
			isSettledByArbitrator,
		);

	if (isSameAddress(current.buyer, walletUserAddress)) {
		return amountBuyer;
	}

	if (isSameAddress(current.seller, walletUserAddress)) {
		return amountSeller;
	}

	if (isSameAddress(current.marketplace, walletUserAddress)) {
		return amountMarketplace;
	}

	return amountArbitrator;
};

export const calculateSplit = (
	group: EscrowStatusView[],
	walletUserAddress: string,
) =>
	group.reduce((acc, current) => {
		const amount = getSplitFromLoggedUser(current, walletUserAddress);
		return acc.plus(amount);
	}, new BigNumber(0));
