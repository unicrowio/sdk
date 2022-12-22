import { getHost } from "../config";
import { ethers } from "ethers";

export const ensToAddress = async (ensName: string) => {
  const provider = new ethers.providers.JsonRpcProvider(
    getHost("mainnet"),
    "mainnet",
  );
  const address = await provider.resolveName(ensName);
  return address;
};
