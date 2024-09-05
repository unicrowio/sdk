import { getWeb3Provider } from "../wallet";

export const ensToAddress = async (ensName: string) => {
  const provider = getWeb3Provider();
  const address = await provider.resolveName(ensName);
  return address;
};
