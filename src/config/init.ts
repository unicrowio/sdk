import { getHost } from "./index";
import {
	networks as DefaultNetworks,
} from "../wallet/networks";

export type DefaultNetwork = "arbitrum" | "arbitrumTestnet" | "development";

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

function initNetworks({
	networks,
	defaultNetwork = "arbitrum",
	autoSwitchNetwork = false,
	mainnetRPCUrl,
}: IConfig) {
	const fallbacks = {
		arbitrum:
			networks?.arbitrum?.rpcUrl || DefaultNetworks.arbitrum?.rpcUrls[0],
		arbitrumTestnet:
			networks?.arbitrumTestnet?.rpcUrl ||
			DefaultNetworks.arbitrumTestnet?.rpcUrls[0],
		development:
			networks?.development?.rpcUrl || DefaultNetworks.development?.rpcUrls[0],
	};

	if (networks?.arbitrum)
		globalThis.arbitrum = globalThis.arbitrum || fallbacks.arbitrum;
	if (networks?.arbitrumTestnet)
		globalThis.arbitrumTestnet =
			globalThis.arbitrumTestnet || fallbacks.arbitrumTestnet;
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
	globalThis.mainnetRPCUrl = mainnetRPCUrl || getHost('mainnet');
}

export default initNetworks;
