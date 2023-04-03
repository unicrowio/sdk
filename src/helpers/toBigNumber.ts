import { ethers } from "ethers";

export const parse = (value: string | number | BigInt, decimals: number) => {
  try {
    return ethers.parseUnits(String(value), decimals);
  } catch (error) {
    console.error(error);
    throw new Error("Invalid amount value");
  }
};
