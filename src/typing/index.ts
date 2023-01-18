import { IQuery } from "../indexer/internal/queryBuilder";
import Deferred from "../helpers/deferred";
import { BigNumber as BigNumberJs } from "bignumber.js";

export type tTokenSymbol = "DAI" | "USDT" | "USDC" | "ETH" | string;

interface IEnsAddresses {
  seller?: string;
  arbitrator?: string;
  marketplace?: string;
}

/**
 * Properties of a token, incl. decimals as in its rounding precision.
 *
 */
export interface IToken {
  /** 'DAI' | 'USDT' | 'USDC' | 'ETH' | string  */
  symbol?: tTokenSymbol;
  address?: string;
  /** Number of token decimals. To get "human readable" format, divide the amount by pow(10, decimals) */
  decimals?: number;
}

/**
 * All properties needed for a payment.
 *
 */
export interface IPaymentProps {
  /** Amount in token */
  amount: string | BigNumberJs | number;
  /** Whom is the payment for */
  seller: string;
  /** Initial challenge period (in seconds) */
  challengePeriod: number;
  /** address of the token used in the payment */
  tokenAddress?: string;
  /** address of a marketplace that has facilitated the payment */
  marketplace?: string;
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee?: number;
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator?: string | null;
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee?: number;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension?: number;
  /** ENS Addresses */
  ensAddresses?: IEnsAddresses;
}

export interface IArbitratorData {
  address: string;
  fee: number;
  splitBuyer: number;
  splitSeller: number;
}

export enum EscrowStatus {
  UNPAID = "Unpaid",
  PAID = "Paid",
  RELEASED = "Released",
  PERIOD_EXPIRED = "Period Expired",
  REFUNDED = "Refunded",
  CHALLENGED = "Challenged",
  SETTLED = "Settled",
}

export type tEscrowParty = "buyer" | "seller" | null;

/**
 * Full status of an escrow.
 *
 */
export interface IEscrowStatus {
  /** The current state of an escrow (PAID | UNPAID | RELEASED | PERIOD_EXPIRED | REFUNDED | CHALLENGED | SETTLED). */
  state: EscrowStatus;
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;
  /** address of who sent the latest challenge ('buyer' | 'seller' | null) */
  latestChallengeBy: tEscrowParty;
  /** address of who sent the latest settlement offer ('buyer' | 'seller' | null) */
  latestSettlementOfferBy: tEscrowParty;
}

export interface EscrowStatusView {
  amount: BigNumberJs; // ERC20 | Ether
  escrow_id: number;
  status: keyof typeof EscrowStatus;

  // Addresses
  marketplace: string | null;
  buyer: string;
  seller: string;
  currency: string;

  challenge_period: number;
  challenge_period_start: number;
  challenge_period_end: number;

  // Split
  split_seller: number;
  split_buyer: number;
  split_protocol: number;
  split_marketplace: number;

  // Consensus
  consensus_seller: number;
  consensus_buyer: number;

  claimed: boolean;

  paid_at: number;

  arbitrated: boolean;
  arbitrator_fee?: number;

  latest_settlement_offer_address?: string;
  latest_settlement_offer_seller?: number;
  latest_settlement_offer_buyer?: number;
}

export interface IEscrowData {
  amount: BigNumberJs; // ERC20 | Ether
  escrowId: number;

  status: IEscrowStatus;

  // Addresses
  marketplace: string | null;
  buyer: string;
  seller: string;
  token: IToken;

  challengePeriod: number;
  challengePeriodStart: Date;
  challengePeriodEnd: Date;

  // Split
  splitBuyer: number;
  splitSeller: number;
  splitProtocol: number;
  splitMarketplace: number;

  // Consensus
  consensusBuyer: number;
  consensusSeller: number;

  createdAt?: Date;

  // Settlement
  latestSettlementOfferAddress?: string;
  latestSettlementOfferSeller?: number;
  latestSettlementOfferBuyer?: number;

  /** ENS Addresses */
  ensAddresses?: IEnsAddresses;
}

export interface IEscrowDataWithTokenInfo extends IEscrowData {
  tokenInfo: IToken;
}

export interface GenericParsedTxPayload {
  name: string;
  transactionHash: string;
  blockNumber: number;
  escrowId: number;
}

/**
 * The data sent by the user when he approves an arbitrator for a payment.
 *
 */
export type ApproveArbitratorParsedPayload = GenericParsedTxPayload & {
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator: string | null;
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number;
  /** Has the escrow been decided by the arbitrator, false if value === null // TODO: verify if true */
  statusArbitration: "ArbitratorApproved";
};

/**
 * The data sent by the user when he approves a payment settlement.
 *
 */
export type ApproveSettlementParsedPayload = GenericParsedTxPayload & {
  /* The date when payment has been settled at */
  settledAt: Date;
  /** How much was the buyer offered in the latest settlement offer */
  latestSettlementOfferBuyer: number;
  /** How much was the seller offered in the latest settlement offer */
  latestSettlementOfferSeller: number;
  /** Who sent the payment */
  buyer: string;
  /** Whom is the payment for */
  seller: string;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number;
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date;
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date;
  /** address of a marketplace that has facilitated the payment */
  marketplace: string;
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number;
  /** Token used in the payment (null for ETH) */
  currency: string | null;
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number;
  /** Seller's agreement on the arbitrator */
  consensusSeller: number;
  /** Current buyer's split based on the latest action on the escrow */
  splitBuyer: number;
  /** Current seller's split based on the latest action on the escrow */
  splitSeller: number;
  /** Marketplace fee (bips) */
  splitMarketplace: number;
  /** Protocol fee (bips) */
  splitProtocol: number;
  /** Amount in token */
  amount: string;
  /** Buyer's final share in percentage incl. fees */
  amountBuyer: string;
  /** Seller's final share in percentage incl. fees */
  amountSeller: string;
  /** Marketplace's final share in percentage incl. fees */
  amountMarketplace: string;
  /** Protocol's final share in percentage incl. fees */
  amountProtocol: string;
  /** Arbitrator's final share in percentage incl. fees */
  amountArbitrator: string;
};

/**
 * The data sent by an arbitrator when he makes his arbitration proposal.
 */
export type ArbitrateParsedPayload = GenericParsedTxPayload & {
  settledAt: Date;
  /** Who sent the payment */
  buyer: string;
  /** Whom is the payment for */
  seller: string;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number;
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date;
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date;
  /** address of a marketplace that has facilitated the payment */
  marketplace: string;
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number;
  /** Token used in the payment (null for ETH) */
  currency: string | null;
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number;
  /** Seller's agreement on the arbitrator */
  consensusSeller: number;
  /** Current buyer's split based on the latest action on the escrow */
  splitBuyer: number;
  /** Current seller's split based on the latest action on the escrow */
  splitSeller: number;
  /** Marketplace fee (bips) */
  splitMarketplace: number;
  /** Protocol fee (bips) */
  splitProtocol: number;
  /** Amount in token */
  amount: string;
  /** Buyer's final share in percentage incl. fees */
  amountBuyer: string;
  /** Seller's final share in percentage incl. fees */
  amountSeller: string;
  /** Marketplace's final share in percentage incl. fees */
  amountMarketplace: string;
  /** Protocol's final share in percentage incl. fees */
  amountProtocol: string;
  /** Arbitrator's final share in percentage incl. fees */
  amountArbitrator: string;
};

/**
 * The data sent either by the buyer or seller when they challenge a payment.
 *
 */
export type ChallengeParsedPayload = GenericParsedTxPayload & {
  /* The date when payment has been challenged at */
  challengedAt: Date;
  /** Who sent the payment */
  buyer: string;
  /** Whom is the payment for */
  seller: string;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number;
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date;
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date;
  /** address of a marketplace that has facilitated the payment */
  marketplace: string;
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number;
  /** Token used in the payment (null for ETH) */
  currency: string | null;
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number;
  /** Seller's agreement on the arbitrator */
  consensusSeller: number;
  splitBuyer: number;
  splitSeller: number;
  splitMarketplace: number;
  splitProtocol: number;
  /** Amount in token */
  amount: string;
};

export type ClaimParsedPayload = GenericParsedTxPayload & {
  amountBuyer: string;
  amountSeller: string;
  amountMarketplace: string;
  amountProtocol: string;
  amountArbitrator: string;
};

/**
 * The data sent by either the buyer or seller when he claims an escrow.
 *
 */
export type MultipleClaimParsedPayload = GenericParsedTxPayload & {
  /** The data for a single claim of an escrow share. (array with amountBuyer, amountSeller, amountMarketplace, amountProtocol, amountArbitrator) */
  payload: ClaimParsedPayload[];
};

/**
 * The data sent by either the buyer or seller when he proposes an escrow settlement.
 *
 */
export type OfferSettlementParsedPayload = GenericParsedTxPayload & {
  /* The date when payment has been offered at */
  settlementOfferAt: Date;
  latestSettlementOfferBuyer: number;
  latestSettlementOfferSeller: number;
  /** address of who sent the latest settlement offer. */
  latestSettlementOfferAddress: string;
};

/**
 * The data sent by either buyer or seller when he initalizes a new payment.
 *
 */
export type PayParsedPayload = GenericParsedTxPayload & {
  /* The date when payment has been paid at */
  paidAt: Date;
  /** Address of the arbitrator */
  arbitrator: string;
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number;
  /** Who sent the payment */
  buyer: string;
  /** Whom is the payment for */
  seller: string;
  /** Initial challenge period (in seconds) */
  challengePeriod: number;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number;
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date;
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date;
  /** address of a marketplace that has facilitated the payment */
  marketplace: string;
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number;
  /** Token used in the payment (null for ETH) */
  tokenAddress?: string;
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number;
  /** Seller's agreement on the arbitrator */
  consensusSeller: number;
  splitBuyer: number;
  splitSeller: number;
  splitMarketplace: number;
  splitProtocol: number;
  /** Amount in token */
  amount: string;
  /** Current buyer's split based on the latest action on the escrow */
  amountBuyer: string;
  /** Current seller's split based on the latest action on the escrow */
  amountSeller: string;
  /** Marketplace fee (bips) */
  amountMarketplace: string;
  /** Arbitrator fee (bips) */
  amountArbitrator: string;
  /** Protocol fee (bips) */
  amountProtocol: string;
};

/**
 * The data sent by either the buyer or seller when he proposes an arbitrator for an escrow.
 *
 */
export type ProposalArbitratorParsedPayload = GenericParsedTxPayload & {
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator: string | null;
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number;
  /** Address of the proposer */
  proposer: string;
  /** status of the arbitration  */
  statusArbitration: "ArbitratorProposed";
};

export type ReleaseParsedPayload = GenericParsedTxPayload & {
  releasedAt: Date;
  buyer: string;
  seller: string;
  challengePeriodExtension: number;
  challengePeriodStart: Date;
  challengePeriodEnd: Date;
  marketplace: string;
  marketplaceFee: number;
  currency: string;
  claimed: boolean;
  consensusBuyer: number;
  consensusSeller: number;
  splitBuyer: number;
  splitSeller: number;
  splitMarketplace: number;
  splitProtocol: number;
  amount: string;
  amountBuyer: string;
  amountSeller: string;
  amountMarketplace: string;
  amountProtocol: string;
  amountArbitrator: string;
};

export interface IGenericTransactionCallbacks {
  connectingWallet?: (payload?: any) => void;
  connected?: (payload?: any) => void;
  switchingNetwork?: (payload?: any) => void;
  broadcasting?: (payload?: any) => void;
  broadcasted?: (payload: any) => void;
  confirmed?: (payload: any) => void;
}

export interface IPayTransactionPayload {
  transactionHash: string;
  name?: string;
  blockNumber?: number;
  escrowId?: number;
  arbitratorFee?: number;
  paidAt?: Date;
  arbitrator?: string;
  buyer?: string;
  seller?: string;
  challengePeriod?: number;
  challengePeriodExtension?: number;
  challengePeriodStart?: Date;
  challengePeriodEnd?: Date;
  marketplace?: string;
  marketplaceFee?: number;
  tokenAddress?: string;
  claimed?: boolean;
  consensusBuyer?: number;
  consensusSeller?: number;
  splitBuyer?: number;
  splitSeller?: number;
  splitMarketplace?: number;
  splitProtocol?: number;
  amount?: string;
  amountBuyer?: string;
  amountSeller?: string;
  amountMarketplace?: string;
  amountArbitrator?: string;
  amountProtocol?: string;
}

/**
 * The callbacks one could set up for a payment.
 *
 */
export interface IPayTransactionCallbacks extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (data: IPayTransactionPayload) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: IPayTransactionPayload) => void;
}

export type IReleasedTransactionPayload = ReleaseParsedPayload;

export interface IReleasedTransactionBroadcastPayload {
  transactionHash: string;
}

/**
 * The callbacks one could set up for an escrow release.
 *
 */
export interface IReleaseTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (data: IReleasedTransactionBroadcastPayload) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: IReleasedTransactionPayload) => void;
}

export interface ISettlementTransactionPayload {
  transactionHash: string;
  splitBuyer: number;
  splitSeller: number;
}

/**
 * The callbacks one could set up for a settlement approval.
 *
 */
export interface ISettlementApproveTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (data: ISettlementTransactionPayload) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: ApproveSettlementParsedPayload) => void;
}

/**
 * The callbacks one could set up for a settlement offer.
 *
 */
export interface ISettlementOfferTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (data: ISettlementTransactionPayload) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: OfferSettlementParsedPayload) => void;
}

export interface IAddArbitratorTransactionPayload {
  transactionHash: string;
}

export interface IChallengeTransactionPayload {
  transactionHash: string;
}

/**
 * The callbacks one could set up for an escrow challenge.
 *
 */
export interface IChallengeTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (data: IChallengeTransactionPayload) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: IChallengeTransactionPayload) => void;
}

export interface IArbitrationTransactionPayload {
  transactionHash: string;
  arbitrator: string;
  arbitratorFee: number;
}

export interface IArbitrateTransactionPayload {
  transactionHash: string;
  splitBuyer: number;
  splitSeller: number;
}

/**
 * The callbacks one could set up for an arbitration.
 *
 */
export interface IArbitrationTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (
    data: IArbitrationTransactionPayload | IArbitrateTransactionPayload,
  ) => void;
  /** Called when the transaction is minted */
  confirmed?: (
    data:
      | ProposalArbitratorParsedPayload
      | ApproveArbitratorParsedPayload
      | ArbitrateParsedPayload,
  ) => void;
}

export interface IRefundTransactionPayload {
  transactionHash: string;
}

/**
 * The callbacks one could set up for a refund.
 *
 */
export interface IRefundTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (data: IRefundTransactionPayload) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: IRefundTransactionPayload) => void;
}

export interface IClaimTransactionPayload {
  transactionHash: string;
}

/**
 * The callbacks one could set up for a claim.
 *
 */
export interface IClaimTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (data: IClaimTransactionPayload) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: IClaimTransactionPayload) => void;
}
export interface IPaymentModalProps {
  paymentProps: IPaymentProps;
  deferredPromise: Deferred<any>;
  callbacks?: IPayTransactionCallbacks;
}

export interface IReleaseModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IReleaseTransactionCallbacks;
}

export interface IRefundModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IRefundTransactionCallbacks;
}

export interface IChallengeModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IChallengeTransactionCallbacks;
}

export interface IArbitrationModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IArbitrationTransactionCallbacks;
}

export type tConnectedUser =
  | "buyer"
  | "seller"
  | "arbitrator"
  | "marketplace"
  | "other";

export interface IBalance {
  amount: string;
  amountInUSD?: string;
  token?: IToken;
  status: "Pending" | "Ready to claim";
}

export interface IBalanceResponse {
  pending: IBalance[];
  readyForClaim: IBalance[];
}

/**
 * Info about the token, the claim and escrow status etc.
 *
 */
export interface IBalanceWithTokenInfo extends IBalance {
  /** amount converted to human readable form */
  displayableAmount: string | BigNumberJs;
  /** helper field used when calculating with other BigNumber fields */
  amountBN: BigNumberJs;
  /** user's role in the escrow ('buyer' | 'seller' | 'arbitrator' | 'marketplace' | 'other') */
  connectedUser: tConnectedUser;
  /** the address of the connected user */
  connectedWallet: string;
  /** Indicates status of the payment (PAID | UNPAID | RELEASED | PERIOD_EXPIRED | REFUNDED | CHALLENGED | SETTLED) */
  statusEscrow: IEscrowStatus;
}

/**
 * Used for calculations of the user balance.
 *
 */
export interface GetResponseUserBalance {
  /** Balance in escrows where the challenge period hasn't ended yet */
  pending: IBalanceWithTokenInfo[];
  /** Balance that can be claimed from the contract */
  readyForClaim: IBalanceWithTokenInfo[];
}

export interface IClaimMultipleModalProps {
  escrowIds: number[];
  balances: GetResponseUserBalance;
  deferredPromise: Deferred<any>;
  callbacks?: IClaimTransactionCallbacks;
}

export interface IClaimModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IClaimTransactionCallbacks;
}

export type TPaymentListQueryParams = IQuery;

export interface IPage {
  limit: number;
  page: number;
}

export interface IGetPaymentListResponse {
  totalCount: number;
  data: IEscrowData[];
}

export interface IndexerInstance {
  getPaymentList: (
    queryParams: TPaymentListQueryParams,
    pagination: IPage,
  ) => Promise<IGetPaymentListResponse>;
  getSinglePayment: (escrowId: number) => Promise<IEscrowData | null>;
  getUserBalance: (
    walletUserAddress: string,
  ) => Promise<GetResponseUserBalance>;
  getClaimableEscrows: (walletUserAddress: string) => Promise<string[]>;
}

export interface IArbitratorContractData {
  arbitrated: boolean;
  consensusBuyer: boolean;
  consensusSeller: boolean;
  arbitrator: string;
  arbitratorFee: string;
}

/**
 * Properties of an escrow settlement.
 *
 */
export interface ISettlement {
  /** address of who sent the latest settlement offer */
  latestSettlementOfferAddress: string;
  latestSettlementOfferBuyer: number;
  latestSettlementOfferSeller: number;
}

/**
 * Properties of an escrow arbitration.
 *
 */
export interface IArbitratorInfo {
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator: string | null;
  /** Seller's agreement on the arbitrator */
  consensusSeller: boolean;
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: boolean;
  /** Has the escrow been decided by the arbitrator */
  arbitrated: boolean;
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number;
}

export type IGetConnectedUser = {
  buyer: string;
  seller: string;
  arbitrator: string | null;
  marketplace: string | null;
};

/**
 * All data of an escrow incl. info about the arbitrator, settlement and current user.
 *
 */
export interface IGetEscrowData extends Omit<IEscrowData, "tokenAddress"> {
  /** interface with tokenAddress, decimals, symbol */
  token: IToken;
  /** interface with arbitrator, consensusSeller, consensusBuyer, arbitrated, arbitratorFee */
  arbitration: IArbitratorInfo | null;
  /** interface with latestSettlementOfferAddress, latestSettlementOfferBuyer, latestSettlementOfferSeller */
  settlement: ISettlement | null;
  /** user's role in the escrow ('buyer' | 'seller' | 'arbitrator' | 'marketplace' | 'other') */
  connectedUser: tConnectedUser;
  /** the address of the connected user */
  connectedWallet: string;
}

export interface ISettlementOfferModalProps {
  escrowId: number;
  escrowData?: IGetEscrowData;
  deferredPromise: Deferred<any>;
  callbacks?: ISettlementOfferTransactionCallbacks;
}

export interface ISettlementApproveModalProps {
  escrowId: number;
  escrowData?: IGetEscrowData;
  deferredPromise: Deferred<any>;
  callbacks?: ISettlementApproveTransactionCallbacks;
}
export interface IArbitrateModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IArbitrationTransactionCallbacks;
}

/**
 * The info needed for calculating the status of an escrow.
 *
 */
export interface ICalculateStatusParams {
  /** Whom is the payment for */
  seller: string;
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number;
  /** Seller's agreement on the arbitrator */
  consensusSeller: number;
  /** Seller's final share in percentage incl. fees */
  splitSeller: number;
  /** Buyer's share, and fees, in bips */
  splitBuyer: number;
  expires: Date;
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;
  /** address of who sent the latest settlement offer. */
  latestSettlementOfferAddress?: string;
}

/**
 * The info needed for calculating the share of each party of an escrow.
 *
 */
export type CalculateAmountsInput = {
  amount: number;
  /** Buyer's share, and fees, in bips */
  splitBuyer: number;
  /** Seller's share, and fees, in bips */
  splitSeller: number;
  /** Protocol's share, and fees, in bips */
  splitProtocol: number;
  /** Marketplace's share, and fees, in bips */
  splitMarketplace: number;
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee?: number;
};

/**
 * The amounts for each party of an escrow.
 *
 */
export type tShares = {
  /** Buyer's final share in percentage incl. fees */
  amountBuyer: number;
  /** Seller's final share in percentage incl. fees */
  amountSeller: number;
  /** Protocol's final share in percentage incl. fees */
  amountProtocol: number;
  /** Marketplace's final share in percentage incl. fees */
  amountMarketplace: number;
  /** Arbitrator's final share in percentage incl. fees */
  amountArbitrator: number;
};

export type tSplits = {
  /** Buyer's final share in percentage incl. fees */
  splitBuyer: BigNumberJs;
  /** Seller's final share in percentage incl. fees */
  splitSeller: BigNumberJs;
  /** Protocol's final share in percentage incl. fees */
  splitProtocol: BigNumberJs;
  /** Marketplace's final share in percentage incl. fees */
  splitMarketplace: BigNumberJs;
  /** Arbitrator's final share in percentage incl. fees */
  splitArbitrator: BigNumberJs;
};

export type CalculateFunction = CalculateAmountsInput;

export type DefaultNetwork = "arbitrum" | "goerli" | "development";

export type Network = {
  rpcUrl: string;
};

export type Networks = {
  [key in DefaultNetwork]?: Network;
};

export interface IConfig {
  networks?: Networks;
  defaultNetwork?: DefaultNetwork;
  autoSwitchNetwork?: boolean;
  mainnetRPCUrl?: string;
}

export default {};
