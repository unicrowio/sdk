const contracts = {
  // Arbitrum mainnet Unicrow Contract Addresses
  arbitrum: {
    unicrow: "0x24e9ECC6c56dcD0C875fDF181FA3A4EEf3c5D5F0",
    dispute: "0xab32831aA9bBFEB12F1BA7B74eBFf76e45944937",
    arbitrator: "0xF1447b0fda912a6857B5d77d7cDE9663266896cf",
    claim: "0x40F83551803051676eB7Cb0374176d03db247b97",
  },
  // Private RPC development Unicrow Contract Addresses
  development: {
    unicrow: "0x229A9DEd51df3D9680A8f82a433b13eF7Cfc9978",
    dispute: "0x2736A9A556c3259e527978bC249D519b85FB9097",
    arbitrator: "0x07525a1F8B01e5806557e9472ba688bCa44BB655",
    claim: "0xEc1080E3A2e0a1657107eb5D4b8c233c356eb02f",
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
