<h1 align="center">
   <a href="#"> Unicrow SDK </a>
</h1>

<h3 align="center">
   This SDK makes integration of the UE seamless for e-commerce developers
</h3>

<h4 align="center">
	 Status: NPM Private
</h4>

<p align="center">
 <a href="#about">About</a> •
 <a href="#features">Features</a> •
 <a href="#how-it-works">How it works</a> •
 <a href="#tech-stack">Tech Stack</a> •
 <a href="#user-content-license">License</a>

</p>

## About

🪙 Universal Escrow allows any buyer to pay for any goods or services to any seller while using a trustless, autonomous escrow service to secure the trade. The service runs in a open, permissionless, and unstoppable smart contract.

** This SDK makes integration of the UE seamless for e-commerce developers. **

---

## How to install

```
yarn install @unicrowio/sdk
```

or

```
npm install @unicrowio/sdk
```


> ps. Once we are currently in private npm and this SDK depends of the "@unicrowio/ethers-types" private lib. Then, we need do this adtional steps:

1. Create [Access Token](https://www.npmjs.com/settings/unicrowio/packages)
2. Run in the terminal: `npm config set '//registry.npmjs.org/:_authToken' "YOUR_ACCESS_TOKEN"` 
3. Take a look at the version of the "@unicrowio/sdk" on [package.json](./package.json)


---

## Features

- [x] Pay:

  - [x] Direct
  - [x] Request Payment

- [x] Release

  - [x] ...

- [x] Challenge

  - [x] ...

- [x] Balance

  - [x] ...

- [x] Claim
  - [x] ...

---

## How it works

This project is divided into two parts:

1. With UI (components)
2. Functions Interfaces (core)

### Pre-requisites

Before you begin, you will need to have the following tools installed on your machine:
[Git] (https://git-scm.com), [Node.js] (https://nodejs.org/en/).
In addition, it is good to have an editor to work with the code like [VSCode] (https://code.visualstudio.com/)

#### Run

1. `yarn install` to install dependencies
2. `yarn dev` to start a server with hot reload
3. `yarn test` to run the tests
4. `yarn build` to generate new bundle
5. Assure that `yarn link` was ran in the crow-sdk project
6. `yarn link @unicrowio/sdk` to add your local crow-sdk project as dependency on node_modules folder

7. Thats all

In order to use this project as dependency without having to publish it all the time, on can run `yarn link` to expose this project as globally installed module an then, on the application that will be using this module as dependency, `yarn link sdk`. It will add this very module to the node_modules through symbolic links. After this setup, all changes in this project will be reflected in every module that has it linked.

---

## Tech Stack

The following tools were used in the construction of the project:

#### **Website** ([React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/))

- **[tsup 🚀](https://tsup.egoist.sh/)**

> See the file [package.json](https://github.com/popstand/crow-sdk/blob/develop/package.json)

---

## License

<!-- This project is under the license [ISC](./LICENSE). -->

Made with love by Popstand - Dev Team 👋🏽 [Get in Touch!](https://popstand.com)

---
# sdk
