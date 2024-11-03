import { UnicrowConfig } from "typing";

declare global {
  interface Window {
    ethereum: any;
  }
  // rome-ignore lint/style/noVar: The use of var here is intended (global variable)
  var unicrow: UnicrowConfig;
}

/* If your module exports nothing, you'll need this line. Otherwise, delete it */
export {};
