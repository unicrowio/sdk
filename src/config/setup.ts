import { networks } from "../wallet/networks";

export const setupNetwork = (
  chainId = BigInt(42161),
  autoSwitchNetwork = false,
) => {
  let network = networks.find((network) => network.chainId === chainId);
  if (!network) throw new Error(`Network ${chainId} is not supported yet.`);

  globalThis.defaultNetwork = network;
  globalThis.autoSwitchNetwork = autoSwitchNetwork;
};

setupNetwork();
