import { ethers } from "ethers";

export const formatAmount = (
  amount: bigint,
  precision: number | bigint,
): string => {
  try {
    return ethers.formatUnits(amount, precision);
  } catch (error) {
    throw new Error(`Formatting error, invalid amount: '${amount}'.`);
  }
};

export const parseAmount = (
  amount: string,
  precision: number | bigint,
): bigint => {
  try {
    return ethers.parseUnits(amount, precision);
  } catch (error) {
    throw new Error(`Parsing error, invalid amount: '${amount}'.`);
  }
};
