import { IConfig, DefaultNetwork } from "../typing";
import { networks as DefaultNetworks } from "../wallet/networks";

/**
 * Allows to switch between all the supported networks.
 *
 * @param param0 Network configuration
 */
export const setupNetwork = ({
  defaultNetwork = DefaultNetwork.Arbitrum,
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
