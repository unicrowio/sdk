import { ethers } from "ethers";
import { getContractAddress } from "../config";
import {
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
  getCurrentWalletAddress,
  autoSwitchNetwork,
  getNetwork
} from "../wallet";
import {
  DataStructOutput,
  SettlementStructOutput,
  TokenStruct,
  ArbitratorStructOutput,
  EscrowStructOutput,
} from "@unicrowio/ethers-types/src/contracts/Unicrow";

const getConnectedUser = async ({
  buyer,
  seller,
  arbitrator,
  marketplace,
}: IGetConnectedUser) => {
  const walletAddress = await getCurrentWalletAddress();
  let connectedUser: tConnectedUser | undefined;
  if (isSameAddress(walletAddress, buyer)) {
    connectedUser = "buyer";
  } else if (isSameAddress(walletAddress, seller)) {
    connectedUser = "seller";
  } else if (!!arbitrator && isSameAddress(walletAddress, arbitrator)) {
    connectedUser = "arbitrator";
  } else if (isSameAddress(walletAddress, marketplace)) {
    connectedUser = "marketplace";
  } else {
    connectedUser = "other";
  }

  return { connectedUser, walletAddress };
};

const parseArbitration = (
  data: ArbitratorStructOutput,
): IArbitratorInfo | null => {
  if (data === null || data.arbitrator === ethers.ZeroAddress) return null;
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
  data: EscrowStructOutput,
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
    Number(data.challengePeriodStart) * 1000,
  );
  const challengePeriodEnd: Date = new Date(
    Number(data.challengePeriodEnd) * 1000,
  );
  const tokenAddress: string = data.currency;
  const challengePeriod: number = Number(data.challengeExtension);
  const amount: bigint = data.amount;

  // Consensus
  const consensusBuyer: number = Number(data.consensus[consensus.BUYER]);
  const consensusSeller: number = Number(data.consensus[consensus.SELLER]);

  const splitProtocol: number = percentageUnicrow;
  const splitBuyer: number = percentageBuyer;
  const splitSeller: number = percentageSeller;
  const splitMarketplace: number = percentageMarketplace;

  const claimed = Boolean(data.claimed);
  const marketplace: string | null = nullOrValue(data.marketplace);

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

  const paymentReference = data.paymentReference;

  return {
    challengePeriod,
    challengePeriodStart,
    challengePeriodEnd,
    status,
    escrowId,
    amount,
    // Addresses
    marketplace,
    buyer,
    seller,
    token: {
      address: tokenAddress,
    },
    paymentReference,
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
  if (data.latestSettlementOfferBy === ethers.ZeroAddress) return null;

  const [latestSettlementOfferBuyer, latestSettlementOfferSeller] =
    bipsToPercentage(data.latestSettlementOffer);

  return {
    latestSettlementOfferAddress: data.latestSettlementOfferBy,
    latestSettlementOfferBuyer,
    latestSettlementOfferSeller,
  };
};

const parseToken = async (data: TokenStruct): Promise<IToken | null> => {
  // is ETH
  if (data.address_ === ethers.ZeroAddress) {
    return {
      address: null,
      decimals: 18,
      symbol: "ETH",
    };
  // adding a check for USDT on Arbitrum here, it returns USD₮0 symbol from the contract,
  // which is not very use friendly, so we're overriding it manually
  } else if (isSameAddress(data.address_.toString(), "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9") && (await getNetwork()).chainId == BigInt(42161)) {
    return {
      address: data.address_.toString(),
      symbol: "USD₮",
      decimals: 6,
    };
  }

  // is ERC-20
  return {
    address: data.address_.toString(),
    symbol: data.symbol,
    decimals: Number(data.decimals),
  };
};

const parse = async (escrowId: number, data: DataStructOutput): Promise<any> => {
  const arbitration: IArbitratorInfo | null = parseArbitration(data.arbitrator);

  const settlement: ISettlement | null = parseSettlement(data.settlement);
  const token: IToken | null = (await parseToken(data.token));
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
 *    challengePeriodStart: "2024-09-12T15:07:45.000Z",   // Start of the current challenge period
 *    challengePeriodEnd: "2024-09-26T15:07:45.000Z",     // End of the current challenge period
 *    status: {
 *       state: "Released",
 *       latestChallengeBy: null,
 *       latestSettlementOfferBy: null,
 *       claimed: true                                    // Claimed from the escrow (by buyer's Release in this case)
 *    },
 *    escrowId: 2,
 *    amount: "100000000000000000",                       // Amount in wei
 *    marketplace: null,
 *    buyer: "0x8A62....D1D8",                            // Shortened in docs, but otherwise returned in full
 *    seller: "0xf463b....0560",
 *    token: {
 *       address: null,
 *       decimals: 18,                                    // Use pow(10, <this>) to convert to standard units
 *       symbol: "ETH"
 *    },
 *    paymentReference: "",                               // A text reference, e.g. order ID
 *    splitMarketplace: 0,                                // Marketplace fee
 *    splitBuyer: 0,                                      // Buyer's share in current status (0 for Paid, Released)
 *    splitSeller: 100,                                   // Seller's share in current status (100 for Paid, Released)
 *    splitProtocol: 0.69,                                // Protocol fee
 *    consensusBuyer: 1,                                  // Buyer's consensus (see contracts docs for how this works)
 *    consensusSeller: 1,                                 // Seller's consensus
 *    arbitration: null,
 *    settlement: null,
 *    connectedUser: "buyer",
 *    walletAddress: "0x8A62....D1D8"
 * }
 *
 * // An escrow with 100 USDT, an arbitrator and marketplace with fees, which was challenged by buyer and has a settlement offer from the seller looks like this:
 * {
 *    challengePeriod: 604800,
 *    challengePeriodStart: "2024-09-12T15:19:14.000Z",
 *    challengePeriodEnd: "2024-09-26T15:19:14.000Z",
 *    status: {
 *       state: "Released",
 *       latestChallengeBy: null,
 *       latestSettlementOfferBy: null,
 *       claimed: true
 *    },
 *    escrowId: 3,
 *    amount: 100000000,
 *    marketplace: "0x696207De45d897d5a353af3c45314a2F852d5B63",
 *    buyer: "0xF257DD5731A679E6642FCd9c53e4e26A1206527e",
 *    seller: "0xf463b32cad657fe03921014d99490A0a58290560",
 *    token: {
 *       address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *       symbol: "USDT",
 *       decimals: 6
 *    },
 *    paymentReference: "order #1337",
 *    splitMarketplace: 10,
 *    splitBuyer: 0,
 *    splitSeller: 100,
 *    splitProtocol: 0.69,
 *    consensusBuyer: 1,
 *    consensusSeller: 1,
 *    arbitration: {
 *       arbitrator: "0x59f56CFC88E5660b7D68C4797c6484168eC8E068",
 *       consensusSeller: true,
 *       consensusBuyer: true,
 *       arbitrated: false,
 *       arbitratorFee: 2
 *    },
 *    settlement: null,
 *    connectedUser: "buyer",
 *    walletAddress: "0xf257dd5731a679e6642fcd9c53e4e26a1206527e"
 * }
 *
 * @param escrowId - ID of the escrow
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

  if (allEscrowData.escrow.buyer === ethers.ZeroAddress) {
    throw new Error(`EscrowId: ${escrowId} doesn't exist`);
  }

  const { escrow, token, arbitration, settlement } = await parse(
    escrowId,
    allEscrowData,
  );

  const marketplace = nullOrValue(escrow.marketplace);

  const { connectedUser, walletAddress } = await getConnectedUser({
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
    walletAddress,
    marketplace,
  };
};
