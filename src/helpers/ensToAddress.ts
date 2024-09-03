import { getBrowserProvider } from "../core/internal/getBrowserProvider";

export const ensToAddress = async (ensName: string) => {
  const provider = getBrowserProvider();
  const address = await provider.resolveName(ensName);
  return address;
};
