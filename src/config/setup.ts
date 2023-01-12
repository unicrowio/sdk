import { getHost } from "./index";
import { networks as DefaultNetworks } from "../wallet/networks";

export type DefaultNetwork = "arbitrum" | "goerli" | "development";

type Network = {
  rpcUrl: string;
};

type Networks = {
  [key in DefaultNetwork]?: Network;
};

interface IConfig {
  networks?: Networks;
  defaultNetwork?: DefaultNetwork;
  autoSwitchNetwork?: boolean;
  mainnetRPCUrl?: string;
}

function config({
  networks,
  defaultNetwork = "arbitrum",
  autoSwitchNetwork = false,
  mainnetRPCUrl,
}: IConfig) {
  const fallbacks = {
    arbitrum:
      networks?.arbitrum?.rpcUrl || DefaultNetworks.arbitrum?.rpcUrls[0],
    goerli: networks?.goerli?.rpcUrl || DefaultNetworks.goerli?.rpcUrls[0],
    development:
      networks?.development?.rpcUrl || DefaultNetworks.development?.rpcUrls[0],
  };

  if (networks?.arbitrum)
    globalThis.arbitrum = globalThis.arbitrum || fallbacks.arbitrum;
  if (networks?.goerli)
    globalThis.goerli = globalThis.goerli || fallbacks.goerli;
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
  globalThis.mainnetRPCUrl = mainnetRPCUrl || getHost("mainnet");
}

export default config;
