import { displayableAmountBI } from "./displayAmount";

export const formatAmount = (
  amount: string | number | bigint,
  precision: number,
): string => {
  try {
    const uxAmount = displayableAmountBI(BigInt(amount), precision);
    return uxAmount.toString();
  } catch (error) {
    throw new Error(
      `Invalid amount: '${amount}'. It should be a valid number.`,
    );
  }
};
