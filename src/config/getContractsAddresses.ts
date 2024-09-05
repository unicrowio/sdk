import { networks, UnicrowNetwork } from "../wallet/networks";
import { getNetwork } from "../wallet";

export const getContractsAddresses = async (): Promise<
  UnicrowNetwork["addresses"]
> => {
  let chainId = (await getNetwork())?.chainId;
  if (chainId === null) throw new Error(`Wallet not connected.`);

  let network = networks.find((network) => network.chainId === chainId);
  if (!network) throw new Error(`Network ${chainId} is not supported yet.`);

  return network.addresses;
};
