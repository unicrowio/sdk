import { CHAIN_ID } from "../helpers";
const arbitrumRpcUrl = globalThis.arbitrum || "https://arb1.arbitrum.io/rpc";
const mainnetRpcUrl =
  "https://mainnet.infura.io/v3/68b30eaff3a24581ae1c8b12581b5043";
const developmentRpcUrl =
  globalThis.development || "https://rpc-net.unicrow.io";
const sepoliaRpcUrl =
  globalThis.sepolia || "https://ethereum-sepolia-rpc.publicnode.com";

export interface UnicrowNetwork {
  chainId: bigint;
  chainName: string;
  displayName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export const networks: { [name: string]: UnicrowNetwork } = {
  arbitrum: {
    chainId: CHAIN_ID.arbitrumOne,
    chainName: "Arbitrum One",
    displayName: "Arbitrum",
    nativeCurrency: {
      name: "Arbitrum Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [arbitrumRpcUrl],
    blockExplorerUrls: ["https://arbiscan.io/"],
  },
  mainnet: {
    chainId: CHAIN_ID.mainnet,
    chainName: "Ethereum",
    displayName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [mainnetRpcUrl],
    blockExplorerUrls: ["https://etherscan.io/"],
  },
  development: {
    chainId: CHAIN_ID.development,
    chainName: "Unicrow Testnet",
    displayName: "Unicrow Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [developmentRpcUrl],
  },
  sepolia: {
    chainId: CHAIN_ID.sepolia,
    chainName: "Ethereum Sepolia Testnet",
    displayName: "Ethereum Sepolia Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [sepoliaRpcUrl],
  },
};
