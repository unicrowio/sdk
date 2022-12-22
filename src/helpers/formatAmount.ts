import BigNumber from "bignumber.js";
import { displayableAmountBN, displayDecimals } from "./displayAmount";

export const formatAmount = (
  amount: string | number | BigNumber,
  precision: number,
  symbol: string,
): string => {
  try {
    const bnPrecision = new BigNumber(10).pow(precision);
    const _amount = BigNumber.isBigNumber(amount)
      ? amount
      : new BigNumber(amount).times(bnPrecision);

    return displayableAmountBN(_amount, precision).toFixed(
      displayDecimals(symbol),
    );
  } catch (error) {
    throw new Error(
      `Invalid amount: '${amount}'. It should be a valid number.`,
    );
  }
};
