import { BigNumber } from "ethers";
import { BigNumber as BigNumberJs } from "bignumber.js";
import { getContractAddress } from "../config";
import {
  ADDRESS_ZERO,
  consensus,
  nullOrValue,
  bipsToPercentage,
  isSameAddress,
} from "../helpers";
import { calculateStatus } from "./calculateStatus";
import {
  IArbitratorInfo,
  tConnectedUser,
  IEscrowData,
  IGetConnectedUser,
  IGetEscrowData,
  ISettlement,
  IToken,
} from "../typing";

import { Unicrow__factory } from "@unicrowio/ethers-types";
import {
  getWeb3Provider,
  getWalletAccount,
  autoSwitchNetwork,
} from "../wallet";

import {
  DataStructOutput,
  SettlementStructOutput,
  TokenStruct,
} from "@unicrowio/ethers-types/src/Unicrow";

const getConnectedUser = async ({
  buyer,
  seller,
  arbitrator,
  marketplace,
}: IGetConnectedUser) => {
  const connectedWallet = await getWalletAccount();
  let connectedUser: tConnectedUser | undefined;
  if (isSameAddress(connectedWallet, buyer)) {
    connectedUser = "buyer";
  } else if (isSameAddress(connectedWallet, seller)) {
    connectedUser = "seller";
  } else if (!!arbitrator && isSameAddress(connectedWallet, arbitrator)) {
    connectedUser = "arbitrator";
  } else if (isSameAddress(connectedWallet, marketplace)) {
    connectedUser = "marketplace";
  } else {
    connectedUser = "other";
  }

  return { connectedUser, connectedWallet };
};

const parseArbitration = (data): IArbitratorInfo | null => {
  if (data === null || data.arbitrator === ADDRESS_ZERO) return null;
  return {
    arbitrator: data.arbitrator,
    consensusSeller: data.sellerConsensus,
    consensusBuyer: data.buyerConsensus,
    arbitrated: data.arbitrated,
    arbitratorFee: bipsToPercentage([data.arbitratorFee])[0],
  };
};

const parseEscrow = (
  escrowId: number,
  data,
  latestSettlementOfferAddress?: string,
): IEscrowData => {
  const [
    percentageBuyer,
    percentageSeller,
    percentageMarketplace,
    percentageUnicrow,
  ] = bipsToPercentage(data.split);

  const seller: string = data.seller;
  const buyer: string = data.buyer;
  const challengePeriodStart: Date = new Date(
    data.challengePeriodStart.toNumber() * 1000,
  );
  const challengePeriodEnd: Date = new Date(
    data.challengePeriodEnd.toNumber() * 1000,
  );
  const tokenAddress: string = data.currency;
  const challengePeriod: number = data.challengeExtension.toNumber();
  const amount: BigNumber = data.amount;

  // Consensus
  const consensusBuyer: number = data.consensus[consensus.BUYER];
  const consensusSeller: number = data.consensus[consensus.SELLER];

  const splitProtocol: number = percentageUnicrow;
  const splitBuyer: number = percentageBuyer;
  const splitSeller: number = percentageSeller;
  const splitMarketplace: number = percentageMarketplace;

  const claimed = Boolean(data.claimed);
  const marketplace: string | null = nullOrValue(data.marketplace);

  const amountBigNumberJs = new BigNumberJs(amount.toString());

  const status = calculateStatus({
    seller,
    consensusBuyer,
    consensusSeller,
    splitSeller,
    splitBuyer,
    expires: challengePeriodEnd,
    claimed,
    latestSettlementOfferAddress,
  });

  return {
    challengePeriod,
    challengePeriodStart,
    challengePeriodEnd,
    status,
    escrowId,
    amount: amountBigNumberJs,
    // Addresses
    marketplace,
    buyer,
    seller,
    token: {
      address: tokenAddress,
    },
    // Splits
    splitMarketplace,
    splitBuyer,
    splitSeller,
    splitProtocol,
    // Consensus
    consensusBuyer,
    consensusSeller,
  };
};

const parseSettlement = (data: SettlementStructOutput): ISettlement | null => {
  if (data.latestSettlementOfferBy === ADDRESS_ZERO) return null;

  const [latestSettlementOfferBuyer, latestSettlementOfferSeller] =
    bipsToPercentage(data.latestSettlementOffer);

  return {
    latestSettlementOfferAddress: data.latestSettlementOfferBy,
    latestSettlementOfferBuyer,
    latestSettlementOfferSeller,
  };
};

const parseToken = (data: TokenStruct): IToken | null => {
  // is ETH
  if (data.address_ === ADDRESS_ZERO)
    return {
      address: null,
      decimals: 18,
      symbol: "ETH",
    };

  // is ERC-20
  return {
    address: data.address_,
    symbol: data.symbol,
    decimals: Number(data.decimals),
  };
};

const parse = (escrowId: number, data: DataStructOutput): any => {
  const arbitration: IArbitratorInfo | null = parseArbitration(data.arbitrator);

  const settlement: ISettlement | null = parseSettlement(data.settlement);
  const token: IToken | null = parseToken(data.token);
  const escrow: IEscrowData = parseEscrow(
    escrowId,
    data.escrow,
    settlement?.latestSettlementOfferAddress,
  );

  return {
    escrow,
    token,
    arbitration,
    settlement,
  };
};

/**
 * Get all information about an escrow: Escrow details, Token, Arbitration, Settlement
 *
 * Returns null if some attributes, like arbitration or settlement are not specified
 *
 * @example // The most simple escrow for 1 ETH with no arbitrator or marketplace returns something like this:
 * {
 *    challengePeriod: 1209600,                           // Challenge period extension in seconds
 *    challengePeriodStart: "2023-01-27T16:31:07.000Z",   // Start of the current challenge period
 *    challengePeriodEnd: "2023-02-10T16:31:07.000Z",     // End of the current challenge period
 *    status: {
 *       state: "Paid",                                   // Paid, CP not ended, or refunded, etc.
 *       latestChallengeBy: null,
 *       latestSettlementOfferBy: null,
 *       claimed: false                                   // Hasen't been claimed from the escrow
 *    },
 *    escrowId: 593,
 *    amount: "1000000000000000000",                      // Amount in wei
 *    marketplace: null,
 *    buyer: "0xD024....5861",                            // Shortened in docs, but otherwise returned in full
 *    seller: "0xA981....041D",
 *    token: {
 *       address: null,
 *       decimals: 18,                                    // Use pow(10, this) to convert to standard units
 *       symbol: "ETH"
 *    },
 *    splitMarketplace: 0,                                // Marketplace fee
 *    splitBuyer: 0,                                      // Buyer's share in current status (0 for Paid, Released)
 *    splitSeller: 100,                                   // Seller's share in current status (100 for Paid, Released)
 *    splitProtocol: 0.69,                                // Protocol fee
 *    consensusBuyer: 0,                                  // Buyer's consensus (see contracts docs for how this works)
 *    consensusSeller: 1,                                 // Seller's consensus
 *    arbitration: null,
 *    settlement: null,
 *    connectedUser: "buyer",
 *    connectedWallet: "0xd024....5861"
 * }
 *
 * // An escrow with 1,000 USDT, an arbitrator and marketplace with fees, which was challenged by buyer and has a settlement offer from the seller looks like this:
 * {
 *    challengePeriod: 1209600,
 *    challengePeriodStart: "2023-02-10T16:32:33.000Z",
 *    challengePeriodEnd: "2023-02-24T16:32:33.000Z",
 *    status: {
 *       state: "Challenged",
 *       latestChallengeBy: "buyer",                      // Buyer challenged
 *       latestSettlementOfferBy: "seller",               // Seller offered a settlement (see below for details)
 *       claimed: false
 *    },
 *    escrowId: 594,
 *    amount: "1000000000",
 *    marketplace: "0xf8C0....f187",                      // This address will receive a marketplace fee (below)
 *    buyer: "0xD0244....5861",
 *    seller: "0xA9813....041D",
 *    token: {
 *       address: "0xFd08....Cbb9",                       // USDT Arbitrum address
 *       symbol: "USDT",                                  // Symbol from the token's contract
 *       decimals: 6
 *    },
 *    splitMarketplace: 5,                                // 5% marketplace fee (not paid if challenge is successful or payment is refunded)
 *    splitBuyer: 100,                                    // Since buyer challenged, their split is 100
 *    splitSeller: 0,                                     // Since buyer challenged, seller's split is 0
 *    splitProtocol: 0.69,                                // Protocol fee (not paid if challenge is successful)
 *    consensusBuyer: 1,
 *    consensusSeller: -1,                                // This means seller is currently challenged 1st time
 *    arbitration: {
 *       arbitrator: "0x3C86....9B66",                    // Address of the proposed or defined arbitrator
 *       consensusSeller: true,                           // Whether seller agreed (implicitly or explicitly) on the arbitrator
 *       consensusBuyer: true,                            // If both buyer and seller consensus is true, the arbitrator is set
 *       arbitrated: false,                               // The arbitrator hasn't stepped in yet
 *       arbitratorFee: 2                                 // Arbitrator's fee in %
 *    },
 *    settlement: {
 *       latestSettlementOfferAddress: "0xA981....041D",  // Who sent the latest settlement offer
 *       latestSettlementOfferBuyer: 20,                  // Buyer was offered to get 20% back
 *       latestSettlementOfferSeller: 80                  // Seller asked to receive 80% (minus fees)
 *    },
 *    connectedUser: "seller",
 *    connectedWallet: "0xa9813....041d"
 * }
 *
 * @param escrowId ID of the escrow
 * @throws Error if escrow id doesn't exist.
 * @returns All details about the escrowed payment
 */
export const getEscrowData = async (
  escrowId: number,
): Promise<IGetEscrowData> => {
  const provider = await getWeb3Provider();

  if (!provider) {
    throw new Error("Error on Getting Escrow Data, Account Not connected");
  }

  await autoSwitchNetwork();

  const Unicrow = Unicrow__factory.connect(
    getContractAddress("unicrow"),
    provider,
  );

  const allEscrowData: DataStructOutput = await Unicrow.getAllEscrowData(
    escrowId,
  );

  if (allEscrowData.escrow.buyer === ADDRESS_ZERO) {
    throw new Error(`EscrowId: ${escrowId} doesn't exist`);
  }

  const { escrow, token, arbitration, settlement } = parse(
    escrowId,
    allEscrowData,
  );

  const marketplace = nullOrValue(escrow.marketplace);

  const { connectedUser, connectedWallet } = await getConnectedUser({
    buyer: nullOrValue(escrow.buyer),
    seller: escrow.seller,
    arbitrator: arbitration?.arbitrator,
    marketplace: escrow?.marketplace,
  });

  // duplicated with object token
  delete escrow.tokenAddress;

  return {
    ...escrow,
    token,
    arbitration,
    settlement,
    connectedUser,
    connectedWallet,
    marketplace,
  };
};
