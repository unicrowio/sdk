import BigNumber from "bignumber.js";
import { ZERO } from "../helpers/constants";
import {
	CalculateAmountsInput,
	CalculateFunction,
	tShares,
	tSplits,
} from "../typing";

// Functions

const calculatePercentage = (n1: number, n2: number) => {
	return n1 > 0 ? new BigNumber(n1).multipliedBy(n2).dividedBy(100) : ZERO;
};

const calculateShares = (newSplit: tSplits, amount: number) =>
	({
		amountBuyer: calculatePercentage(
			newSplit.splitBuyer.toNumber(),
			amount,
		).toNumber(),
		amountSeller: calculatePercentage(
			newSplit.splitSeller.toNumber(),
			amount,
		).toNumber(),
		amountProtocol: calculatePercentage(
			amount,
			newSplit.splitProtocol.toNumber(),
		).toNumber(),
		amountMarketplace: calculatePercentage(
			amount,
			newSplit.splitMarketplace.toNumber(),
		).toNumber(),
		amountArbitrator: calculatePercentage(
			newSplit.splitArbitrator.toNumber(),
			amount,
		).toNumber(),
	}) as tShares;

const zeroSplits = () => {
	return {
		splitBuyer: ZERO,
		splitProtocol: ZERO,
		splitSeller: ZERO,
		splitMarketplace: ZERO,
		splitArbitrator: ZERO,
	} as tSplits;
};

const calculateSharesWithoutArbitration = ({
	amount,
	splitBuyer,
	splitProtocol,
	splitSeller,
	splitMarketplace,
	arbitratorFee = 0,
}: CalculateFunction) => {
	const newSplit = zeroSplits();

	newSplit.splitProtocol = calculatePercentage(splitProtocol, splitSeller);
	newSplit.splitMarketplace = calculatePercentage(
		splitMarketplace,
		splitSeller,
	);

	newSplit.splitArbitrator = calculatePercentage(arbitratorFee, splitSeller);

	newSplit.splitSeller = new BigNumber(splitSeller)
		.minus(newSplit.splitProtocol)
		.minus(newSplit.splitMarketplace)
		.minus(newSplit.splitArbitrator);

	newSplit.splitBuyer = new BigNumber(splitBuyer);

	const shares = calculateShares(newSplit, amount);

	return shares;
};

const calculateSharesWithArbitration = ({
	amount,
	splitBuyer,
	splitProtocol,
	splitSeller,
	splitMarketplace,
	arbitratorFee = 0,
}: CalculateFunction) => {
	const newSplit = zeroSplits();
	newSplit.splitArbitrator = new BigNumber(arbitratorFee);
	newSplit.splitProtocol = calculatePercentage(splitProtocol, splitSeller);

	newSplit.splitMarketplace = calculatePercentage(
		splitMarketplace,
		splitSeller,
	);

	newSplit.splitSeller = new BigNumber(splitSeller)
		.minus(newSplit.splitMarketplace)
		.minus(newSplit.splitProtocol)
		.minus(
			new BigNumber(arbitratorFee).multipliedBy(splitSeller).dividedBy(100),
		);

	newSplit.splitBuyer = new BigNumber(splitBuyer).minus(
		new BigNumber(arbitratorFee)
			.multipliedBy(new BigNumber(splitBuyer))
			.dividedBy(100),
	);

	const shares = calculateShares(newSplit, amount);

	return shares;
};

/**
 * Calculates how the balance in the escrow are split between all the relevant parties.
 *
 * @returns {tShares}
 */
export const calculateAmounts = (
	data: CalculateAmountsInput,
	isSettledByArbitrator = false,
) => {
	return isSettledByArbitrator
		? calculateSharesWithArbitration(data)
		: calculateSharesWithoutArbitration(data);
};
