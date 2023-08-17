import { ethers } from "ethers";

export const formatAmount = (
  amount: bigint,
  precision: number | bigint,
): string => {
  try {
    return ethers.formatUnits(amount, precision);
  } catch (error) {
    throw new Error(
      `Invalid amount: '${amount}'. It should be a valid bigint.`,
    );
  }
};

export const parseAmount = (
  amount: string,
  precision: number | bigint,
): bigint => {
  try {
    return ethers.parseUnits(amount, precision);
  } catch (error) {
    throw new Error(
      `Invalid amount: '${amount}'. It should be a valid string.`,
    );
  }
};
