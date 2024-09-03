import { IConfig } from "../typing";
import { networks as DefaultNetworks } from "../wallet/networks";

export const setupNetwork = ({
  defaultNetwork = "arbitrum",
  autoSwitchNetwork = false,
}: IConfig) => {
  globalThis.defaultNetwork = {
    name:
      defaultNetwork ||
      DefaultNetworks[defaultNetwork]?.chainName ||
      DefaultNetworks.arbitrum?.chainName,
    displayName:
      DefaultNetworks[defaultNetwork]?.displayName ||
      DefaultNetworks.arbitrum?.displayName,
    chainId: defaultNetwork
      ? DefaultNetworks[defaultNetwork].chainId
      : DefaultNetworks.arbitrum.chainId,
  };
  globalThis.autoSwitchNetwork = autoSwitchNetwork;
};

setupNetwork({});
