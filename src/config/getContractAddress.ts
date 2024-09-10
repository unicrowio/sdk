const contracts = {
  // Arbitrum mainnet Unicrow Contract Addresses
  arbitrum: {
    unicrow: "0x24e9ECC6c56dcD0C875fDF181FA3A4EEf3c5D5F0",
    dispute: "0xab32831aA9bBFEB12F1BA7B74eBFf76e45944937",
    arbitrator: "0xF1447b0fda912a6857B5d77d7cDE9663266896cf",
    claim: "0x40F83551803051676eB7Cb0374176d03db247b97",
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
