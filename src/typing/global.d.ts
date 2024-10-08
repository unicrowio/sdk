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
  var defaultNetwork: Network = {};
  var autoSwitchNetwork: boolean;
}

/* If your module exports nothing, you'll need this line. Otherwise, delete it */
export {};
