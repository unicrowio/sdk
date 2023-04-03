import { ethers } from "ethers";

export const isValidAddress = (address: string) => {
  if (!address || address?.trim() === "") return false;
  return ethers.isAddress(address.trim());
};
