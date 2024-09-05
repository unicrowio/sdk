# Unicrow SDK

Unicrow Software Development Kit provides a convenient way of integrating the protocol’s smart contracts.

To get a quick hands-on experience with using the SDK, check out our [SDK Tutorial](https://github.com/unicrowio/sdk-tutorial).

The SDK is organized in modules as follows:

- UI - functions integrating Unicrow contracts via modals that give users overview of the selected escrow payment, provide UI elements for the actions they can take, and give them updates on the status of the actions. Use these to save time on developing your own front-end.
- Core - functions that interact with the contracts directly and provide updates to the front-end via callbacks. Use these if you want to embed the contract interaction into your system, or to read data from the contract.
- Wallet - web3 wallet integration functions. The SDK takes care of the wallet integration automatically wherever necessary, so these are optional to use.
- Indexer - functions to read escrow information from the indexer. While it is possible to read data for a single escrow from the contract directly via core functions, using the indexer is necessary to search or list multiple escrows or to read user’s overall balance in the contract in case the app doesn’t keep records in other ways.

**Note: In order to continuously and quickly improve SDK’s developer experience, we might introduce small breaking changes in the first couple of months after the launch.**

**We promise to avoid such situations as much as possible, but if it'll happen, the changes will be announced in the [#breaking-changes](https://discord.gg/6vnHwuKmwS) Discord channel, and explained along with the version number in the function comments. To get notified about such changes, we recommend to enable the channel's notifications.**

## Getting Started

To get a quick hands-on experience with using the SDK, check out our [SDK Tutorial](https://github.com/unicrowio/sdk-tutorial). Otherwise you can follow the steps and see some basic functions below.

### Install

```bash
yarn add @unicrowio/sdk
```

or

```bash
npm install @unicrowio/sdk
```

### Import

```js
import unicrowSdk from "@unicrowio/sdk";
```

### Pay

```js
await result = unicrowSdk.ui.pay({
  amount: <amount_in_ETH_or_token>,    // use whole units, not weis
  seller: “<address_or_ens>”,          // whom is the payment for*
  challengePeriod: <seconds>,          // how long can the buyer challenge*
  challengePeriodExtension: <seconds>, // by how much the challenge period will be extended after a challenge
  tokenAddress: “<address>”,           // address of the payment token (null for ETH)
  marketplace: “<address_or_ens>”,     // a marketplace that processes the payment
  marketplaceFee: “<%>”,               // a fee that the marketplace charges
  arbitrator: “<address_or_ens>”,      // a 3rd party arbitrator
  arbitratorFee: “<%>”,                // a fee that the arbitrator charges
})                                     // * - required parameters

const escrowId = result.escrowId
```

### Get escrow data

```js
await escrowData = unicrowSdk.core.getEscrowData(escrowId)
```

### Release by the buyer

```js
unicrowSdk.ui.release(escrowId)
```

### Claim by the seller (after the challenge period ended)

```js
unicrowSdk.ui.claim(escrowId)
```

### Change network

The SDK is by default configured to interact with the Arbitrum One network and asks the user to switch to it automatically when any contract-interacting functions are called. We currently support also Arbitrum Sepolia and Unicrow’s private RPC. The automated switch can also be turned off (in such a case, an error is thrown).


```js
unicrowSdk.config({
  defaultNetwork: “<arbitrum|arbitrumSepolia|development>”,
  autoSwitchNetwork: <true|false> // optional, defaults to true
})
```

For more examples, check out the [SDK Tutorial](https://github.com/unicrowio/sdk-tutorial).

## SDK Developers

### Pre-requisites

Before you begin, you will need to have the following tools installed on your machine: [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/).

### Build

- Clone from https://github.com/unicrowio/sdk
- cd to the project directory
- `yarn install` to install dependencies
- `yarn dev` to start a server with hot reload
- `yarn test` to run the tests
- `yarn build` to generate new bundle
- `yarn link @unicrowio/sdk` to add your local crow-sdk project as dependency on node_modules folder
