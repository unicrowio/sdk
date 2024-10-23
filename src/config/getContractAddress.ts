const contracts = {
  // Arbitrum mainnet Unicrow Contract Addresses
  arbitrum: {
    unicrow: "0x78AEe48cCEBCcEe05F550849A7C7Baa1e0837a6D",
    dispute: "0xdC14E36ac67Cd3B8eE25a9c2309EcE6087e93225",
    arbitrator: "0xde62AD20611Fe51179Eb8B66c4627B3495C9B1c2",
    claim: "0x5902AF8be15c80794C3229aD4E68aa69845Cc5fC",
  },
  arbitrumSepolia: {
    unicrow: "0x6d98b03C09EaD582a77C093bdb2d3E85683Aa956",
    dispute: "0x3dC5d22716599e7FcD1bbB1752544D9dfa7e719E",
    arbitrator: "0xdB400Dd10a4A645c2C1429b3A48F1449E7e4F64A",
    claim: "0x7761D841D83c5Aeb876DB2b110798C668cd83872",
  },
  development: {
    // replace these with your local deployment addresses
    unicrow: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    dispute: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    arbitrator: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    claim: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  },
  baseSepolia: {
    unicrow: "0x4d0eEFAB00f5Dc902563F91072e21Ea8eaaE32B8",
    dispute: "0x383AB2D5347050106EEBBB04d216506E7b24044A",
    arbitrator: "0x8AE4BF26B94A955b154FC66eAe8607E1c932dBaB",
    claim: "0xE8A24A574D36818d88736DdE5Ed36360d1ec4a64",
  }
};

type tGetAddress = "unicrow" | "dispute" | "arbitrator" | "claim";

export const getContractAddress = (address: tGetAddress): string => {
  const network = globalThis?.defaultNetwork?.name;

  const addressMap = {
    unicrow: contracts[network]?.unicrow,
    dispute: contracts[network]?.dispute,
    arbitrator: contracts[network]?.arbitrator,
    claim: contracts[network]?.claim,
  };

  return addressMap[address];
};
