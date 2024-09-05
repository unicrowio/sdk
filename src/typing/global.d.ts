import { UnicrowNetwork } from "../wallet/networks";

declare global {
  interface Window {
    ethereum: any;
  }
}

declare module globalThis {
  var defaultNetwork: UnicrowNetwork[];
  var autoSwitchNetwork: boolean;
}

/* If your module exports nothing, you'll need this line. Otherwise, delete it */
export {};
