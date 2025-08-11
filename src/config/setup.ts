import { UnicrowNetwork } from "typing";
export const NETWORK: { [name: string]: UnicrowNetwork } = {
  "42161": {
    chainId: BigInt(42161),
    displayName: "Arbitrum One",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://arbiscan.io/"],
    publicRpcs: ["https://arbitrum-mainnet.infura.io"],
    contracts: {
      unicrow: "0xDb815D9bEaAa8d3bdc714Be3a17dCBA5eCbe876B",
      dispute: "0x7FC340B0CfbA6071374b777dE3ACb05eb4a91908",
      arbitrator: "0x3E454e8c0c14e605F93D6eEda474d12Ec1dAEc75",
      claim: "0x3928C1389E47123238217F1B6D10e42Aec516EAF",
    },
  },
  "421614": {
    chainId: BigInt(421614),
    displayName: "Arbitrum Sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
    publicRpcs: ["https://sepolia-rollup.arbitrum.io/rpc"],
    contracts: {
      unicrow: "0x063d6472df3FdD1cec9B00cac29bcd935511f451",
      dispute: "0xEC8eaCfC2Dd1614b7182676A118088a204F69b86",
      arbitrator: "0x335ba877387646815cb189f9883dF98aa0913EAF",
      claim: "0x310Da0C6c224C14168e7bBEd632797A79B9eff95",
    },
  },
  "8453": {
    chainId: BigInt(8453),
    displayName: "Base",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://basescan.org/"],
    publicRpcs: ["https://mainnet.base.org"],
    contracts: {
      unicrow: "0x19EbA0BE87dF312d9041240ddE468507adaC9e0A",
      dispute: "0x9D0FeAa4DfCa9e3Ae18ad97f90231E9a7C963D84",
      arbitrator: "0x888B745df64eF65399429e1DB3663BCFa5d73a97",
      claim: "0x063d6472df3FdD1cec9B00cac29bcd935511f451",
    },
  },
  "84532": {
    chainId: BigInt(84532),
    displayName: "Base Sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
    publicRpcs: ["https://sepolia.base.org"],
    contracts: {
      unicrow: "0x32fab9f28724c1c5832d5d6830afe498f8abdaac",
      dispute: "0xdb2076dcecc82ed0dd204bf7b6dba44f0fea9e36",
      arbitrator: "0xad8d43ddefaf2779f72340627a81b9f31330c3dd",
      claim: "0x01d612617028f14db6c6f4c00b2a9b4107a90f7a",
    },
  },
  "31337": {
    chainId: BigInt(31337),
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
  "137": {
    chainId: BigInt(137),
    displayName: "Polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorerUrls: ["https://polygonscan.com/"],
    publicRpcs: ["https://polygon-rpc.com"],
    contracts: {
      unicrow: "0xC34dc58b7B9f6e80120d7E92C0c3FA28105DE58d",
      dispute: "0x62966a60988E15af3F952783bD12AECd7a9d4b8e",
      arbitrator: "0x38F17D0752266B7E13D8BB773aaf17BEED09511E",
      claim: "0xf1FE17836D13EEB3aF90D2164bD7EBCA0cF0cA71",
    },
  },
};

/**
 * Sets the target network for all subsequent SDK calls. This is mandatory to call after importing the SDK. Networks and chain IDs currently available:
 * - 42161 - Arbitrum One
 * - 421614 - Arbitrum Sepolia
 * - 8453 - Base
 * - 84532 - Base Sepolia
 * - 137 - Polygon
 *
 * @example unicrowSDK.config({
 *   chainId = BigInt(42161),
 *   autoSwitchNetwork: true
 * })
 * @param options - Configuration options
 * @param options.chainId - Chain ID of one of Unicrow's supported networks (see above)
 * @param options.autoSwitchNetwork - If the user is connected to a different network when a call is about to be performed, ask the user to change to that network (or add it if the user doesn't have it configured)
 */
export const setupNetwork = ({
  chainId = BigInt(42161),
  autoSwitchNetwork = true,
}: {
  chainId?: BigInt;
  autoSwitchNetwork?: boolean;
} = {}) => {
  const network = NETWORK[chainId.toString()];
  if (!network) throw new Error(`Unsupported network: ${chainId}`);

  globalThis.unicrow = {
    network,
    autoSwitchNetwork,
  };
};
