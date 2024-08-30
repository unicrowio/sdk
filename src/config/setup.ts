import { IConfig } from "../typing";
import { networks as DefaultNetworks } from "../wallet/networks";

export const setupNetwork = ({
  networks,
  defaultNetwork = "arbitrum",
  autoSwitchNetwork = false,
  mainnetRPCUrl,
}: IConfig) => {
  const fallbacks = {
    arbitrum:
      networks?.arbitrum?.rpcUrl || DefaultNetworks.arbitrum?.rpcUrls[0],
    sepolia: networks?.sepolia?.rpcUrl || DefaultNetworks.sepolia?.rpcUrls[0],
    development:
      networks?.development?.rpcUrl || DefaultNetworks.development?.rpcUrls[0],
  };

  if (networks?.arbitrum)
    globalThis.arbitrum = globalThis.arbitrum || fallbacks.arbitrum;
  if (networks?.sepolia)
    globalThis.sepolia = globalThis.sepolia || fallbacks.sepolia;
  if (networks?.development)
    globalThis.development = globalThis.development || fallbacks.development;

  globalThis.defaultNetwork = {
    name: defaultNetwork || DefaultNetworks[defaultNetwork]?.chainName,
    displayName:
      DefaultNetworks[defaultNetwork]?.displayName ||
      DefaultNetworks.arbitrum?.displayName,
    chainId: defaultNetwork
      ? DefaultNetworks[defaultNetwork].chainId
      : DefaultNetworks.arbitrum.chainId,
    rpcUrl: defaultNetwork
      ? DefaultNetworks[defaultNetwork]?.rpcUrls[0]
      : DefaultNetworks.arbitrum?.rpcUrls[0],
  };

  globalThis.autoSwitchNetwork = autoSwitchNetwork;
  globalThis.mainnetRPCUrl =
    mainnetRPCUrl || DefaultNetworks.mainnet?.rpcUrls[0];
};

setupNetwork({});
