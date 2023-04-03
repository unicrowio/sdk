import { displayableAmountBI, displayDecimals } from "./displayAmount";

export const formatAmount = (
  amount: string | number | bigint,
  precision: number,
  symbol: string,
): string => {
  try {
    const bnPrecision = BigInt(Math.pow(10, precision));

    const _amount =
      typeof amount === "bigint" ? amount : BigInt(amount) * bnPrecision;

    return displayableAmountBI(_amount, precision).toFixed(
      displayDecimals(symbol),
    );
  } catch (error) {
    throw new Error(
      `Invalid amount: '${amount}'. It should be a valid number.`,
    );
  }
};
