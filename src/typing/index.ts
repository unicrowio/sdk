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
 */
export interface IToken {
  /** 'DAI' | 'USDT' | 'USDC' | 'ETH' | string  */
  symbol?: tTokenSymbol;
  address?: string;
  /** Number of token decimals. To get "human readable" format, divide the amount by pow(10, decimals) */
  decimals?: number;
}

/**
 * Payment data input
 */
export interface IPaymentProps {
  /** Amount in token */
  amount: string | BigNumberJs | number;
  /** Whom is the payment for */
  seller: string;
  /** Initial challenge period (in seconds) */
  challengePeriod: number;
  /** Address of the token used in the payment (skip or set to null for ETH) */
  tokenAddress?: string;
  /** address of a marketplace that has facilitated the payment */
  marketplace?: string;
  /** Marketplace fee in % (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee?: number;
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator?: string | null;
  /** Arbitrator's fee in %. Can be 0 */
  arbitratorFee?: number;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension?: number;
}

export interface IPaymentPropsData extends IPaymentProps {
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

  // Arbitration
  arbitrator?: string;
  arbitrator_fee?: number;
  arbitrated: boolean;
  arbitrator_proposer?: string;
  status_arbitration?: string;

  // Settlement
  latest_settlement_offer_address?: string;
  latest_settlement_offer_seller?: number;
  latest_settlement_offer_buyer?: number;

  paid_at: number;
}

/**
 * Detailed information about the escrow 
 * 
 * @example // A returned object might look e.g. like this:
 * {
 *    challengePeriod: 1209600,
 *    challengePeriodStart: "2023-01-24T11:54:33.000Z",
 *    challengePeriodEnd: "2023-02-07T11:54:33.000Z",
 *    status: {
 *       state: "Paid",
 *       latestChallengeBy: null,
 *       latestSettlementOfferBy: null,
 *       claimed: false
 *    },
 *    escrowId: 434,
 *    amount: "2500000000",
 *    marketplace: "0xf8C03F09b4f53FDc05b57c7846da5F428798f187",
 *    buyer: "0x1cB9dc49C0cC09D72E8dA74a9Ea956A0b1A65ab4",
 *    seller: "0xA98135151f8dCd5632A63CC6358f5684c62B041D",
 *    splitMarketplace: 10,
 *    splitBuyer: 0,
 *    splitSeller: 100,
 *    splitProtocol: 0.69,
 *    consensusBuyer: 0,
 *    consensusSeller: 1,
 *    arbitration: {
 *       arbitrator: "0x3C86F543e64810E1d843809B2b70a4FDcC3b9B66",
 *       consensusSeller: true,
 *       consensusBuyer: true,
 *       arbitrated: false,
 *       arbitratorFee: 0
 *    },
 *    settlement: null,
 *    token: {
 *       address: "0x7eD124F79447a1390281c88bB9bca2AC4F009BBE"
 *    }
 * }
 */
export interface IEscrowData {
  /** Amount in token's (or ETH's) wei unit */
  amount: BigNumberJs; // ERC20 | Ether
  escrowId: number;

  /** See the interface for more details */
  status: IEscrowStatus;

  /** Marketplace address */
  marketplace: string | null;
  /** Buyer (payer) address */
  buyer: string;
  /** Seller (payee) address */
  seller: string;
  /** Information about the payment token  */
  token: IToken;

  /** How much a challenge period will extend by if challenged */
  challengePeriod: number;
  /** Current challenge period start (either payment time or the latest challenge) */
  challengePeriodStart: Date;
  /** Current challenge period end (when it will be possible to claim the payment) */
  challengePeriodEnd: Date;

  /** How much (%) of the payment is meant for the buyer (default 0)  */
  splitBuyer: number;
  /**
   * How much (%) of the payment is meant for the seller (default 100).
   * Buyer and seller splits are "gross", i.e. before fee deduction. 
   * They are recalculated at the time of the claim based on fee and the latest status of the escrow
   */
  splitSeller: number;
  /** Protocol fee (%) */
  splitProtocol: number;
  /** Marketplace fee (%) */
  splitMarketplace: number;

  /**
   * Indicates status of the payment from buyer's and seller's side.
   * Negative value means that party was challenged.
   * 
   * Examples for various states:  <br/>
   *  0, 1: Paid - If the payment is claimed after challenge period ends, consensus remains like this  <br/>
   *  1, 1: Released by buyer  <br/>
   *  1,-1: 1x Challenged by buyer - If the payment is claimed after CP ends, consensus remains like this  <br/>
   * -1, 2: 1x Challenged by buyer and 1x by Seller  <br/>
   *  2,-2: 2x Challenged by buyer, 1x by seller  <br/>
   *  3, 2: Released, Refunded, or Settled. Deduct 1 from each consensus number to calculate number of challenges 
   */
  consensusBuyer: number;

  /** See consensusBuyer for details */
  consensusSeller: number;

  /** When was the payment sent to the escrow */
  createdAt?: Date;

  /** Address that sent the latest settlement offer (if any) */
  latestSettlementOfferAddress?: string;
  /** What was the proposed seller's split in the latest settlement offer */
  latestSettlementOfferSeller?: number;
  /** What was the proposed seller's split in the latest settlement offer */
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
 * Escrow data returned after an arbitrator is approved for the escrow 
 */
export interface ApproveArbitratorParsedPayload extends GenericParsedTxPayload {
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator: string | null;
  /** Arbitrator's fee (%, can be 0) */
  arbitratorFee: number;
  /** Has the escrow been decided by the arbitrator, false if value === null // TODO: verify if true */
  statusArbitration: "ArbitratorApproved";
}

/**
 * Escrow data sent after a settlement offer is approved and the payment is settled
 */
export interface ApproveSettlementParsedPayload extends GenericParsedTxPayload {
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
}

/**
 * Escrow data returned from the contract after an arbitration is sent
 */
export interface ArbitrateParsedPayload extends GenericParsedTxPayload {
  /** Date/time when the arbitration was sent and the payment was settled */
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
}

/**
 * Escrow data returned after a challenge is sent
 */
export interface ChallengeParsedPayload extends GenericParsedTxPayload {
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
  /** Buyer's split after the challenge (100 if the buyer challenged, 0 if the seller challenged */
  splitBuyer: number;
  /** Seller's split after the challenge (0 if the buyer challenged, 100 if the seller challenged */
  splitSeller: number;
  /** Marketplace fee (%) */
  splitMarketplace: number;
  /** Protocol fee (%) */
  splitProtocol: number;
  /** Amount in token */
  amount: string;
}

/** Amounts (in ETH's or token's WEIs) sent to all the parties after the escrow was closed */
export interface ClaimParsedPayload extends GenericParsedTxPayload {
  amountBuyer: string;
  amountSeller: string;
  amountMarketplace: string;
  amountProtocol: string;
  amountArbitrator: string;
}

/**
 * Amounts (in ETH's or token's WEIs) sent to all the parties after multiple escrows were closed 
 */
export interface MultipleClaimParsedPayload extends GenericParsedTxPayload {
  /** The data for a single claim of an escrow share. (array with amountBuyer, amountSeller, amountMarketplace, amountProtocol, amountArbitrator) */
  payload: ClaimParsedPayload[];
}

/**
 * Details of a settlement offer returned from the contract after the offer was sent
 */
export interface OfferSettlementParsedPayload extends GenericParsedTxPayload {
  /* Date/time of the offer */
  settlementOfferAt: Date;
  /** Buyer's share in the offer */
  latestSettlementOfferBuyer: number;
  /** Seller's share in the offer */
  latestSettlementOfferSeller: number;
  /** Address of who sent the offer. */
  latestSettlementOfferAddress: string;
}

/**
 * Escrow data returned after the payment was sent and the escrow was created
 */
export interface PayParsedPayload extends GenericParsedTxPayload {
  /** Date/time of the payment */
  paidAt: Date;
  /** Address of the arbitrator (null if none) */
  arbitrator: string;
  /** Arbitrator's fee (%, can be 0) */
  arbitratorFee: number;
  /** Who sent the payment */
  buyer: string;
  /** Whom is the payment for */
  seller: string;
  /** Initial challenge period (in seconds) */
  challengePeriod: number;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number;
  /** When does the current challenge period start */
  challengePeriodStart: Date;
  /** When does the current challenge period end */
  challengePeriodEnd: Date;
  /** Address of a marketplace that has facilitated the payment */
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
  /** Buyer's split of the escrow (0 by default) */
  splitBuyer: number;
  /** Seller's split of the escrow (100 by default) */
  splitSeller: number;
  /** Marketplace fee (%) */
  splitMarketplace: number;
  /** Protocol fee (%) */
  splitProtocol: number;
  /** Amount in token */
  amount: string;
  /** Current buyer's share (in ETH or token) based on the latest status of the escrow */
  amountBuyer: string;
  /** Current seller's share (in ETH or token) based on the latest status of the escrow */
  amountSeller: string;
  /** Current marketplace feee (in ETH or token) based on the latest status of the escrow */
  amountMarketplace: string;
  /** Current arbitrator feee (in ETH or token) based on the latest status of the escrow */
  amountArbitrator: string;
  /** Current protocol feee (in ETH or token) based on the latest status of the escrow */
  amountProtocol: string;
}

/**
 * Details about arbitrator proposal 
 */
export interface ProposalArbitratorParsedPayload
  extends GenericParsedTxPayload {
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator: string | null;
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number;
  /** Address of the proposer */
  proposer: string;
  /** status of the arbitration  */
  statusArbitration: "ArbitratorProposed";
}

export interface ReleaseParsedPayload extends GenericParsedTxPayload {
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
}

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

export interface IReleasedTransactionPayload extends ReleaseParsedPayload {}

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
 * The indexer returns user's contract balance in this structure
 *
 * @example How returned values might look like for pending and claimable ETH/USDT/USDC balance
 * {
 *   pending: [
 *     {
 *        token: {
 *           address: "0x0000000000000000000000000000000000000000",
 *           symbol: "ETH",
 *           decimals: 18
 *        },
 *        status: "Pending",
 *        amount: "1586200000000000000",
 *        total: "1586200000000000000",
 *        displayableAmount: "1.5862",
 *        amountBN: "1.5862"
 *     }
 *   ],
 *   readyForClaim: [
 *     {
 *        token: {
 *           address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
 *           symbol: "USDC",
 *           decimals: 6
 *        },
 *        status: "Ready to claim",
 *        amount: "1786200000",
 *        total: "1786200000",
 *        displayableAmount: "1786.2",
 *        amountBN: "1786.2"
 *     },
 *     {
 *        token: {
 *           address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *           symbol: "USDT",
 *           decimals: 6
 *        },
 *        status: "Ready to claim",
 *        amount: "2379300000",
 *        total: "2379300000",
 *        displayableAmount: "2379.3",
 *        amountBN: "2379.3"
 *     }
 *   ]
 * }
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

export interface TPaymentListQueryParams extends IQuery {}

export interface IPage {
  limit: number;
  page: number;
}

/**
 * List of escrows returned from the indexer search function
 * 
 * @example // Returned object would look e.g. like this:
 * {
 *    totalCount: 10,
 *    data: [
 *       // List of IEscrowData objects
 *    ]
 * }
 */
export interface IGetPaymentListResponse {
  /** How many records match the criteria in total */
  totalCount: number;
  /** Subset of the escrows matching the criteria based on the defined pagination */
  data: IEscrowData[];
}

/**
 * Returned by the SDK when connecting to the indexer. Contains functions to read escrow data from the indexer 
 */
export interface IndexerInstance {
  /**
   * Get a list of escrows based on defined parameters
   * 
   * @example await indexerInstance.getPaymentList({seller: "0xA98135151f8dCd5632A63CC6358f5684c62B041D"}, {limit: 20, page: 1}
   * 
   * // Returned object would look e.g. like this:
   * {
   *    totalCount: 10,
   *    data: [
   *       // List of IEscrowData objects
   *    ]
   * }
   * 
   * @param queryParams Search parameters
   * @param pagination How many records should be returned from which "page" (defaults to 20, 1)
   * @returns List of escrows
   */
  getPaymentList: (
    queryParams: TPaymentListQueryParams,
    pagination: IPage,
  ) => Promise<IGetPaymentListResponse>;

  /**
   * Reads parameters of a single escrow payment identified by the id
   *  
   * @example // A returned object might look e.g. like this:
   * {
   *    challengePeriod: 1209600,
   *    challengePeriodStart: "2023-01-24T11:54:33.000Z",
   *    challengePeriodEnd: "2023-02-07T11:54:33.000Z",
   *    status: {
   *       state: "Paid",
   *       latestChallengeBy: null,
   *       latestSettlementOfferBy: null,
   *       claimed: false
   *    },
   *    escrowId: 434,
   *    amount: "2500000000",
   *    marketplace: "0xf8C03F09b4f53FDc05b57c7846da5F428798f187",
   *    buyer: "0x1cB9dc49C0cC09D72E8dA74a9Ea956A0b1A65ab4",
   *    seller: "0xA98135151f8dCd5632A63CC6358f5684c62B041D",
   *    splitMarketplace: 10,
   *    splitBuyer: 0,
   *    splitSeller: 100,
   *    splitProtocol: 0.69,
   *    consensusBuyer: 0,
   *    consensusSeller: 1,
   *    arbitration: {
   *       arbitrator: "0x3C86F543e64810E1d843809B2b70a4FDcC3b9B66",
   *       consensusSeller: true,
   *       consensusBuyer: true,
   *       arbitrated: false,
   *       arbitratorFee: 0
   *    },
   *    settlement: null,
   *    token: {
   *       address: "0x7eD124F79447a1390281c88bB9bca2AC4F009BBE"
   *    }
   * }
   * 
   * @param escrowId ID of the escrow
   * @returns Populated escrow data (incl. settlement, arbitration, status, etc. information)
   */
  getSinglePayment: (escrowId: number) => Promise<IEscrowData | null>;
  
  /**
   * Read how much balance does the provided account have in the contract
   * 
   * @example // A returned JSON object  might look like this:
   * {
   *   pending: [
   *     {
   *        token: {
   *           address: "0x0000000000000000000000000000000000000000",
   *           symbol: "ETH",
   *           decimals: 18
   *        },
   *        status: "Pending",
   *        amount: "1586200000000000000",
   *        total: "1586200000000000000",
   *        displayableAmount: "1.5862",
   *        amountBN: "1.5862"
   *     }
   *   ],
   *   readyForClaim: [
   *     {
   *        token: {
   *           address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
   *           symbol: "USDC",
   *           decimals: 6
   *        },
   *        status: "Ready to claim",
   *        amount: "1786200000",
   *        total: "1786200000",
   *        displayableAmount: "1786.2",
   *        amountBN: "1786.2"
   *     },
   *     {
   *        token: {
   *           address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
   *           symbol: "USDT",
   *           decimals: 6
   *        },
   *        status: "Ready to claim",
   *        amount: "2379300000",
   *        total: "2379300000",
   *        displayableAmount: "2379.3",
   *        amountBN: "2379.3"
   *     }
   *   ]
   * }
   * @param walletUserAddress Address of an account to get balance of
   * @returns Balance broken down by tokens and claimability
   */  
  getUserBalance: (
    walletUserAddress: string,
  ) => Promise<GetResponseUserBalance>;

  /**
   * Get list of escrows that are available for claiming by the provided account 
   * 
   * @param walletUserAddress - Address of the account 
   * @returns A list of escrow IDs
   */
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

export interface IGetConnectedUser {
  buyer: string;
  seller: string;
  arbitrator: string | null;
  marketplace: string | null;
}

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
  connectedUser?: tConnectedUser;
  /** the address of the connected user */
  connectedWallet?: string;
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
export interface CalculateAmountsInput {
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
}

/**
 * The amounts for each party of an escrow.
 *
 */
export interface tShares {
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
}

export interface tSplits {
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
}

export interface CalculateFunction extends CalculateAmountsInput {}

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
