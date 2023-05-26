import { DefaultNetwork } from "config/setup";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface Network {
  name: DefaultNetwork;
  chainId: number;
  rpcUrl: string;
}

declare module globalThis {
  var arbitrum: string | undefined;
  var goerli: string | undefined;
  var development: string | undefined;
  var mainnetRPCUrl: string | undefined;
  var defaultNetwork: Network = {};
  var autoSwitchNetwork: boolean;
}

/* If your module exports nothing, you'll need this line. Otherwise, delete it */
export {};
