import BigNumber from "bignumber.js";
import { formatToUSD } from "./formatToUSD";

export const formatAmountToUSD = (
	amount: string | number | BigNumber,
	exchangeValue: number,
): string => {
	const _amountInUSD = BigNumber.isBigNumber(amount)
		? amount
		: new BigNumber(amount);
	const amountInUSD = _amountInUSD
		.times(new BigNumber(exchangeValue))
		.toNumber();
	return formatToUSD(amountInUSD);
};
