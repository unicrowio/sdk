import { CHAIN_ID } from "../helpers";
const arbitrumRpcUrl = globalThis.arbitrum || "https://arb1.arbitrum.io/rpc";
const mainnetRpcUrl =
  "https://mainnet.infura.io/v3/68b30eaff3a24581ae1c8b12581b5043";
const arbitrumTestnetmRpcUrl =
  globalThis.goerli || "https://goerli-rollup.arbitrum.io/rpc";
const developmentRpcUrl =
  globalThis.development || "https://rpc-net.unicrow.io";

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
  goerli: {
    chainId: CHAIN_ID.goerli,
    chainName: "Goerli",
    displayName: "Ethereum Goerli",
    nativeCurrency: {
      name: "Görli Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [arbitrumTestnetmRpcUrl],
    blockExplorerUrls: ["https://goerli.etherscan.io"],
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
};
