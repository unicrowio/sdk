import { displayableAmountBI } from "./displayAmount";

export const formatAmount = (
  amount: string | number | bigint,
  precision: number,
): string => {
  try {
    const bnPrecision = BigInt(Math.pow(10, precision));

    const _amount = BigInt(amount) * bnPrecision;

    return displayableAmountBI(_amount, precision).toString();
  } catch (error) {
    throw new Error(
      `Invalid amount: '${amount}'. It should be a valid number.`,
    );
  }
};
