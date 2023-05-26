import { isAddress } from "ethers";

export const isValidAddress = (address: string) => {
  if (!address || address?.trim() === "") return false;
  return isAddress(address.trim());
};
