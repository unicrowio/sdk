import { ethers } from "ethers";

export const parse = (
  value: string | number | bigint,
  decimals: number | bigint,
) => {
  try {
    return ethers.parseUnits(String(value), decimals);
  } catch (error) {
    console.error(error);
    throw new Error("Invalid amount value");
  }
};
