const contracts = {
  // Arbitrum mainnet Unicrow Contract Addresses
  arbitrum: {
    unicrow: "0x24e9ECC6c56dcD0C875fDF181FA3A4EEf3c5D5F0",
    dispute: "0xab32831aA9bBFEB12F1BA7B74eBFf76e45944937",
    arbitrator: "0xF1447b0fda912a6857B5d77d7cDE9663266896cf",
    claim: "0x40F83551803051676eB7Cb0374176d03db247b97",
  },
  arbitrumSepolia: {
    unicrow: "0x5880500B6582f59B6ad7dF173fb17E8205689Cc2",
    dispute: "0x19EbA0BE87dF312d9041240ddE468507adaC9e0A",
    arbitrator: "0x9D0FeAa4DfCa9e3Ae18ad97f90231E9a7C963D84",
    claim: "0x888B745df64eF65399429e1DB3663BCFa5d73a97",
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
