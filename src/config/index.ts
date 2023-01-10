import { networks } from "../wallet/networks";
import config from "./setup";

export const getHost = (host = "default"): string => {
  if (host === "default") {
    return globalThis?.defaultNetwork?.rpcUrl || networks?.arbitrum?.rpcUrls[0];
  } else if (host === "mainnet") {
    return (
      globalThis?.mainnetRPCUrl ||
      "https://purple-distinguished-vineyard.quiknode.pro/360bd2d54ace2ca5b775f1bf8325875fcd77204f/"
    );
  }
};

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
    unicrow: "0x1e589153C06c334c8d882C49328b72B345499E49",
    dispute: "0x1e5B82795d1d2206868756DE939d6F0fB1ddc152",
    arbitrator: "0x03fCe9c6382A3DFD97a93aD243B20835F520023B",
    claim: "0x52783d0373B4597F1545bD250194E0B50E8f4190",
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

config({
  autoSwitchNetwork: false,
  defaultNetwork: "arbitrum",
});
