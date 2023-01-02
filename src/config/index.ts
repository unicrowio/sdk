import { networks } from "../wallet/networks";
import config from "./config";

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
    unicrow: "0xFEf5DA5c801c137632D51d4ccec16e9a89A91deC",
    dispute: "0xE5758Fe00EebFA200cE0e1e8818eedC6b8101aDb",
    arbitrator: "0x6c3c223F8b5430b6E8D1bC2D2F2377503AC6Ffb8",
    claim: "0xdDfDCa767F9143B804740aFA8087A286E087dF13",
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
