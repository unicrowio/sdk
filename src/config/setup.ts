import { UnicrowNetwork } from "typing";

export const NETWORK: { [name: string]: UnicrowNetwork } = {
  arbitrum: {
    chainId: BigInt(42161),
    chainName: "arbitrum",
    displayName: "Arbitrum One",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://arbiscan.io/"],
    contracts: {
      unicrow: "0x78AEe48cCEBCcEe05F550849A7C7Baa1e0837a6D",
      dispute: "0xdC14E36ac67Cd3B8eE25a9c2309EcE6087e93225",
      arbitrator: "0xde62AD20611Fe51179Eb8B66c4627B3495C9B1c2",
      claim: "0x5902AF8be15c80794C3229aD4E68aa69845Cc5fC",
    },
  },
  arbitrumSepolia: {
    chainId: BigInt(421614),
    chainName: "arbitrumSepolia",
    displayName: "Arbitrum Sepolia Testnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
    contracts: {
      unicrow: "0x6d98b03C09EaD582a77C093bdb2d3E85683Aa956",
      dispute: "0x3dC5d22716599e7FcD1bbB1752544D9dfa7e719E",
      arbitrator: "0xdB400Dd10a4A645c2C1429b3A48F1449E7e4F64A",
      claim: "0x7761D841D83c5Aeb876DB2b110798C668cd83872",
    },
  },
  base: {
    chainId: BigInt(8453),
    chainName: "base",
    displayName: "Base Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://basescan.org/"],
  },
  baseSepolia: {
    chainId: BigInt(84532),
    chainName: "baseSepolia",
    displayName: "Base Sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
    contracts: {
      unicrow: "0x4d0eEFAB00f5Dc902563F91072e21Ea8eaaE32B8",
      dispute: "0x383AB2D5347050106EEBBB04d216506E7b24044A",
      arbitrator: "0x8AE4BF26B94A955b154FC66eAe8607E1c932dBaB",
      claim: "0xE8A24A574D36818d88736DdE5Ed36360d1ec4a64",
    },
  },
  development: {
    chainId: BigInt(31337),
    chainName: "development",
    displayName: "Development (hardhat)",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    contracts: {
      // Replace these with your local deployment addresses
      unicrow: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      dispute: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      arbitrator: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      claim: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    },
  },
};

/**
 * Allows to switch between supported networks (see wallet/networks.ts).
 *
 * @param param0 Network configuration
 */
export const setupNetwork = ({
  network = NETWORK.arbitrum,
  autoSwitchNetwork = false,
}) => {
  globalThis.unicrow = {
    currentNetwork: network,
    autoSwitchNetwork: autoSwitchNetwork,
  };
};

setupNetwork({});
