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
    displayName: "Arbitrum Sepolia Testnet",
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
    displayName: "Base Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://basescan.org/"],
    publicRpcs: ["https://mainnet.base.org"],
    contracts: {
      unicrow: "0x24e9ECC6c56dcD0C875fDF181FA3A4EEf3c5D5F0",
      dispute: "0xab32831aA9bBFEB12F1BA7B74eBFf76e45944937",
      arbitrator: "0xF1447b0fda912a6857B5d77d7cDE9663266896cf",
      claim: "0x40F83551803051676eB7Cb0374176d03db247b97",
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
      unicrow: "0xe0Ee927Fc4B128b20Fb087F2372d21526d636945",
      dispute: "0x81BDA62F4E0e95edaf2ED72985B93e95880D05f7",
      arbitrator: "0xfA8b095785c87F2fc4f19BA9d9a39B3FD17F74ca",
      claim: "0x7c27bE3C886465C9bf831E216FbadcDC4f4d9161",
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
};

/**
 * Sets the target network for all subsequent SDK calls.
 *
 * @param {bigint} chainId - `chainId` of one of Unicrow's supported networks (see: {@link module:wallet~NETWORK})
 * @param {boolean} autoSwitchNetwork - If the user is connected to a different network when a call is about to be performed, send a chain add/switch request
 */
export const setupNetwork = ({
  chainId = BigInt("42161"),
  autoSwitchNetwork = false,
}) => {
  const network = NETWORK[chainId.toString()];
  if (!network) throw new Error(`Unsupported network: ${chainId}`);

  globalThis.unicrow = {
    network,
    autoSwitchNetwork,
  };
};
