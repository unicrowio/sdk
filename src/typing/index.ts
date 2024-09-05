import { IQuery } from "../indexer/internal/queryBuilder";
import Deferred from "../helpers/deferred";

export interface IEnsAddresses {
  buyer?: string;
  seller?: string;
  arbitrator?: string;
  marketplace?: string;
}

/**
 * Properties of a token, incl. decimals as in its rounding precision.
 */
export interface IToken {
  address?: string;
  symbol?: string;
  /** Number of token decimals. To get "human readable" format, divide the amount by pow(10, decimals) */
  decimals?: number;
}

/**
 * Payment data input
 */
export interface IPaymentProps {
  /** Whom is the payment for */
  seller: string;
  /** Amount in token */
  amount: string | number | bigint;
  /** Address of the token used in the payment (skip or set to null for ETH) */
  tokenAddress?: string;
  /** Initial challenge period (in seconds) */
  challengePeriod: number;
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension?: number;
  /** address of a marketplace that has facilitated the payment */
  marketplace?: string;
  /** Marketplace fee in % (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee?: number;
  /** Address of the arbitrator. null for no arbitrator */
  arbitrator?: string | null;
  /** Arbitrator's fee in %. Can be 0 */
  arbitratorFee?: number;
  /** A reference used to identify the payment or provide information for arbitration */
  paymentReference?: string;
  /** Who's the buyer, i.e. who can release the payment or whom should a refund be sent to. Leave empty to assign the user's wallet */
  buyer?: string;
  /** (UI only) A url to redirect to, when the payment is canceled */
  cancelUrl?: string;
  /** (UI only) A url to redirect to, when the payment is done */
  callbackUrl?: string;
}

export interface IValidateProps extends IPaymentProps {
  buyer: string;
}

export interface IPaymentPropsData extends IPaymentProps {
  ensAddresses?: IEnsAddresses;
}

export enum EscrowStatus {
  UNPAID = "Unpaid",
  PAID = "Paid",
  RELEASED = "Released",
  PERIOD_EXPIRED = "Challenge Period Ended",
  REFUNDED = "Refunded",
  CHALLENGED = "Challenged",
  SETTLED = "Settled",
}

export type tEscrowParty = "buyer" | "seller" | null;

/**
 * Full status of a payment
 *
 * @example // A returned object might look e.g. like this:
 * {
 *    state: "Paid",
 *    latestChallengeBy: null,
 *    latestSettlementOfferBy: null,
 *    claimed: false
 * },
 *
 */
export interface IEscrowStatus {
  /** The current state of an escrow ('Paid' | 'Unpaid' | 'Released' | 'Period Expired' | 'Refunded' | 'Challenged' | 'Settled'). */
  state: EscrowStatus;
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;
  /** Who sent the latest challenge ('buyer', 'seller', or null when there's been no challenge) */
  latestChallengeBy: tEscrowParty;
  /** Who sent the latest settlement offer ('buyer', 'seller', or null if there's been no offer) */
  latestSettlementOfferBy: tEscrowParty;
}

/**
 * TODO: add reference
 * Full information about the escrow
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
  amount: bigint; // ERC20 | Ether

  /** ID of the escrow that the transaction created or acted upon */
  escrowId: number;

  /** Indicates status of the payment (claimed, latestChallengeBy, latestSettlementBy and its escrow state like 'Paid' | 'Unpaid' etc.) */
  status: IEscrowStatus;

  /** Marketplace address */
  marketplace: string | null;
  /** Buyer (payer) address */
  buyer: string;
  /** Seller (payee) address */
  seller: string;
  /** Information about the payment token  */
  token: IToken;

  /** Payment reference, e.g. order ID or information for an arbitrator */
  paymentReference: string;

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

/**
 * Returned from confirmed callbacks and includes basic information about the minted transaction and the event it emitted
 */
export interface GenericParsedTxPayload {
  /** Name of the event  */
  name: string;
  /** Transaction hash */
  transactionHash: string;
  /** Number of the block in which the transaction was minted */
  blockNumber: number;
  /** ID of the escrow that the transaction created or acted upon */
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

/**
 * Data about a released escrow
 */
export interface ReleaseParsedPayload extends GenericParsedTxPayload {
  /** Date/time when the escrow was released */
  releasedAt: Date;

  /** Escrow buyer (who paid and released the escrow) */
  buyer: string;

  /** Seller (to whom the payment was paid and released) */
  seller: string;

  /** What was the challenge period extension */
  challengePeriodExtension: number;

  /** When did the last challenge period start */
  challengePeriodStart: Date;

  /** When did the last challenge period end */
  challengePeriodEnd: Date;

  /** Marketplace address */
  marketplace: string;

  /** Marketplace fee (in %) */
  marketplaceFee: number;

  /** Payment token address (null for ETH) */
  currency: string;

  /** If the payment was claimed (always true in this case since release automatically claims) */
  claimed: boolean;

  /** Buyer's consensus about the escrow (always positive in this case since the buyer just released) */
  consensusBuyer: number;

  /** Seller's consensus */
  consensusSeller: number;

  /** Buyer's split (0 in this case) */
  splitBuyer: number;

  /** Seller's split (100 in this case) */
  splitSeller: number;

  /** Marketplace fee (in %) */
  splitMarketplace: number;

  /** Protocol fee (in %) */
  splitProtocol: number;

  /** Total escrow amount in ETH's or token's WEI */
  amount: string;

  /** Amount that was sent to the buyer (0 in this case) */
  amountBuyer: string;

  /** Amount that was sent to the buyer (total amount - fees in this case) */
  amountSeller: string;

  /** Amount sent to the marketplace in ETH's or token's WEI */
  amountMarketplace: string;

  /** Amount sent to the protocol in ETH's or token's WEI */
  amountProtocol: string;

  /** Amount sent to the arbitrator in ETH's or token's WEI */
  amountArbitrator: string;
}

/**
 * Callbacks available for all SDK functions that interact with the contract
 */
export interface IGenericTransactionCallbacks {
  /** Triggered when the function attempts to connect to the wallet */
  connectingWallet?: (payload?: any) => void;

  /** When the wallet is successfully connected */
  connected?: (address: string) => void;

  /** If the user is not connected to the default network and is being asked to switch by the global configuration */
  switchingNetwork?: (payload?: any) => void;

  /** When the transaction is being broadcasted */
  broadcasting?: (payload?: any) => void;

  /** When the transaction was broadcasted (provides txn hash and other relevant info) */
  broadcasted?: (payload: any) => void;

  /** When the transaction was minted (provides detailed information about the escrow after the update) */
  confirmed?: (payload: any) => void;
}

/**
 * Passed to the callbacks when the payment is being broadcasted and confirmed
 */
export interface IPayTransactionPayload {
  transactionHash: string;

  /** Name of the event ('Pay') */
  name?: string;

  /** Number of the block in which the payment transaction was minted */
  blockNumber?: number;

  /** Escrow Id generated by the contract (available only in confirmed callback) */
  escrowId?: number;

  /** Arbitrator fee specified in the payment (%, can be 0) */
  arbitratorFee?: number;

  /** When was the payment sent */
  paidAt?: Date;

  /** Arbitrator address (null if none) */
  arbitrator?: string;

  /** Address of the buyer (who sent the payment) */
  buyer?: string;

  /** Address of the seller (whom is the payment for) */
  seller?: string;

  /** Initial challenge period (seconds) */
  challengePeriod?: number;

  /** By how much does the challenge period extend after each challenge */
  challengePeriodExtension?: number;

  /** When does the current challenge period start (same as paidAt in this case) */
  challengePeriodStart?: Date;

  /** When does the current challenge period end (paidAt + challengePeriod in this case) */
  challengePeriodEnd?: Date;

  /** Address of the marketplace that facilitated the payment (null if none) */
  marketplace?: string;

  /** Marketplace fee (%, can be 0 even if a marketplace was defined) */
  marketplaceFee?: number;

  /** Address of the escrowed token (null for ETH) */
  tokenAddress?: string;

  /** If the payment was claimed (always false here) */
  claimed?: boolean;

  /** Buyer's consensus over the escrow (0 in this case) */
  consensusBuyer?: number;

  /** Seller's consensus over the scrow (1 in this case) */
  consensusSeller?: number;

  /** Buyer's split of the payment (0 in this case) */
  splitBuyer?: number;

  /** Seller's split of the payment (100 in this case) */
  splitSeller?: number;

  /** Marketplace fee (%) */
  splitMarketplace?: number;

  /** Protocol fee (%) */
  splitProtocol?: number;

  /** Payment amount in ETH's or token's WEI */
  amount?: string;

  /** Amount (in ETH's or token's WEI) which the buyer would receive if the payment was claimed as is (0 in this case)  */
  amountBuyer?: string;

  /** Amount (in ETH's or token's WEI) which the seller would receive if the payment was claimed as is (amount - fees in this case)  */
  amountSeller?: string;

  /** Amount (in ETH's or token's WEI) which the marketplace would receive if the payment was claimed as is (amount * fee in this case)  */
  amountMarketplace?: string;

  /** Amount (in ETH's or token's WEI) which the arbitrator would receive if the payment was claimed as is (amount * fee in this case)  */
  amountArbitrator?: string;

  /** Amount (in ETH's or token's WEI) which the protocol would receive if the payment was claimed as is (amount * fee in this case)  */
  amountProtocol?: string;
}

/**
 * Callbacks specific to the initial escrow Payment
 */
export interface IPayTransactionCallbacks extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted (includes payment details) */
  broadcasted?: (data: IPayTransactionPayload) => void;
  /** Called when the transaction is minted (includes payment details) */
  confirmed?: (data: IPayTransactionPayload) => void;
}

export type IReleasedTransactionPayload = ReleaseParsedPayload;

export interface IReleasedTransactionBroadcastPayload {
  transactionHash: string;
}

/**
 * Callbacks specific for escrow release
 */
export interface IReleaseTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted,  */
  broadcasted?: (data: IReleasedTransactionBroadcastPayload) => void;
  /** Called when the transaction is minted (provides details about the escrow after the release) */
  confirmed?: (data: IReleasedTransactionPayload) => void;
}

/**
 * Details about a settlement offer broadcasted to the network
 */
export interface ISettlementTransactionPayload {
  transactionHash: string;

  /** Buyer's share (in %) proposed int the offer */
  splitBuyer: number;

  /** Seller's share (in %) proposed int the offer */
  splitSeller: number;
}

/**
 * Callbacks specific for settlement approval
 */
export interface ISettlementApproveTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted (includes details about the offer) */
  broadcasted?: (data: ISettlementTransactionPayload) => void;
  /** Called when the transaction is minted (includes details about the settled escrow) */
  confirmed?: (data: ApproveSettlementParsedPayload) => void;
}

/**
 * Callbacks specific for settlement offer
 */
export interface ISettlementOfferTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted (includes details about the offer) */
  broadcasted?: (data: ISettlementTransactionPayload) => void;
  /** Called when the transaction is minted (includes details about the escrow with the offer) */
  confirmed?: (data: OfferSettlementParsedPayload) => void;
}

export interface IChallengeTransactionPayload {
  transactionHash: string;
}

/**
 * Callbacks specific to sending a challenge
 */
export interface IChallengeTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted (includes txn hash) */
  broadcasted?: (data: IChallengeTransactionPayload) => void;
  /** Called when the transaction is minted (includes details of the escrow after the challenge) */
  confirmed?: (data: IChallengeTransactionPayload) => void;
}

/**
 * Data provided to callbacks called from proposing or approving an arbitrator
 */
export interface IArbitrationTransactionPayload {
  transactionHash: string;

  /** Arbitrator's address sent in the proposal or approval */
  arbitrator: string;

  /** Arbitrator's fee sent in the proposal or approval */
  arbitratorFee: number;
}

/**
 * Data provided to callbacks called from arbitration
 */
export interface IArbitrateTransactionPayload {
  transactionHash: string;

  /** Buyer's share defined in the arbitration */
  splitBuyer: number;

  /** Seller's share defined in the arbitration */
  splitSeller: number;
}

/**
 * Callbacks specific to arbitrate-related functions
 */
export interface IArbitrateTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (
    data: IArbitrationTransactionPayload | IArbitrateTransactionPayload,
  ) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: ArbitrateParsedPayload) => void;
}

/**
 * Callbacks specific to functions related approving an arbitrator
 */
export interface IApproveArbitrationTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (
    data: IArbitrationTransactionPayload | IArbitrateTransactionPayload,
  ) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: ApproveArbitratorParsedPayload) => void;
}

/**
 * Callbacks specific to functions related proposing an arbitrator
 */
export interface IProposeArbitrationTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted */
  broadcasted?: (
    data: IArbitrationTransactionPayload | IArbitrateTransactionPayload,
  ) => void;
  /** Called when the transaction is minted */
  confirmed?: (data: ProposalArbitratorParsedPayload) => void;
}

/**
 * Provided in the refund callbacks
 */
export interface IRefundTransactionPayload {
  transactionHash: string;
}

/**
 * Refund-specific callbacks
 */
export interface IRefundTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted (includes txn hash) */
  broadcasted?: (data: IRefundTransactionPayload) => void;
  /** Called when the transaction is minted (includes detailed escrow data after the refund) */
  confirmed?: (data: IRefundTransactionPayload) => void;
}

/**
 * Provided in the claim callbacks
 */
export interface IClaimTransactionPayload {
  transactionHash: string;
}

/**
 * Claim-specific callbacks
 */
export interface IClaimTransactionCallbacks
  extends IGenericTransactionCallbacks {
  /** Called when the transaction is broadcasted (includes txn hash) */
  broadcasted?: (data: IClaimTransactionPayload) => void;
  /** Called when the transaction is minted (includes detailed escrow data after the claim) */
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

export interface IArbitrateModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IArbitrateTransactionCallbacks;
}

export interface IApproveOrProposeArbitrationModalProps {
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?:
    | IApproveArbitrationTransactionCallbacks
    | IProposeArbitrationTransactionCallbacks;
}

export type tConnectedUser =
  | "buyer"
  | "seller"
  | "arbitrator"
  | "marketplace"
  | "other";

/**
 * Information about user's balance in an escrow at its current state
 */
export interface IBalance {
  /** Amount in ETH's or token's WEI */
  solidityAmount: bigint;

  /** Amount converted to USD (using Coingecko's API on the client side) */
  amountInUSD?: string;

  /** Information about the token */
  token?: IToken;

  /** Indicates status of the payment (claimed, latestChallengeBy, latestSettlementBy and its escrow state like 'Paid' | 'Unpaid' etc.) */
  status: IEscrowStatus;
}

/**
 * More detailed information about user's balance in an escrow
 */
export interface IBalanceDetailed extends IBalance {
  /** Amount converted to human readable form */
  displayableAmount: string;

  /** User's role in the escrow ('buyer' | 'seller' | 'arbitrator' | 'marketplace' | 'other') */
  connectedUser: tConnectedUser;

  /** Address of the connected user */
  walletAddress: string;
}

/**
 * The indexer returns user's contract balance in this structure. Also,
 * SDK's modal to claim user's balance consumes this as an input to display the balance for the user before claiming
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
 *        status: {
 *           state: "Paid",
 *           latestChallengeBy: null,
 *           latestSettlementOfferBy: null,
 *           claimed: false
 *        },
 *        amount: "1586200000000000000",
 *        total: "1586200000000000000",
 *        displayableAmount: "1.5862",
 *        amountBI: "1.5862"
 *     }
 *   ],
 *   readyForClaim: [
 *     {
 *        token: {
 *           address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
 *           symbol: "USDC",
 *           decimals: 6
 *        },
 *        status: {
 *           state: "Period Expired",
 *           latestChallengeBy: null,
 *           latestSettlementOfferBy: null,
 *           claimed: false
 *        },
 *        amount: "1786200000",
 *        total: "1786200000",
 *        displayableAmount: "1786.2",
 *        amountBI: "1786.2"
 *     },
 *     {
 *        token: {
 *           address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *           symbol: "USDT",
 *           decimals: 6
 *        },
 *        status: {
 *           state: "Period Expired",
 *           latestChallengeBy: null,
 *           latestSettlementOfferBy: null,
 *           claimed: false
 *        },
 *        amount: "2379300000",
 *        total: "2379300000",
 *        displayableAmount: "2379.3",
 *        amountBI: "2379.3"
 *     }
 *   ]
 * }
 */
export interface GetResponseUserBalance {
  /** Balance in escrows where the challenge period hasn't ended yet */
  pending: IBalanceDetailed[];
  /** Balance that can be claimed from the contract */
  readyForClaim: IBalanceDetailed[];
}

export interface IClaimMultipleModalProps {
  chainId: number;
  escrowIds: number[];
  balances: GetResponseUserBalance;
  deferredPromise: Deferred<any>;
  callbacks?: IClaimTransactionCallbacks;
}

export interface IClaimModalProps {
  chainId: number;
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IClaimTransactionCallbacks;
}

export type TPaymentListQueryParams = IQuery;

/**
 * Used to specify paging for indexer's payments search.
 * An app that uses pagination to display payments history can simply provide parameters from the front-end and display everything returned.
 */
export interface IPage {
  /** How many records should be returned on the page */
  limit: number;

  /** Which page should be displayed (starts with 1) */
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
   *       state: "Period Expired",
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
   *        status: {
   *           state: "Period Expired",
   *           latestChallengeBy: null,
   *           latestSettlementOfferBy: null,
   *           claimed: false
   *        },
   *        amount: "1586200000000000000",
   *        total: "1586200000000000000",
   *        displayableAmount: "1.5862",
   *        amountBI: "1.5862"
   *     }
   *   ],
   *   readyForClaim: [
   *     {
   *        token: {
   *           address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
   *           symbol: "USDC",
   *           decimals: 6
   *        },
   *        status: {
   *           state: "Period Expired",
   *           latestChallengeBy: null,
   *           latestSettlementOfferBy: null,
   *           claimed: false
   *        },
   *        amount: "1786200000",
   *        total: "1786200000",
   *        displayableAmount: "1786.2",
   *        amountBI: "1786.2"
   *     },
   *     {
   *        token: {
   *           address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
   *           symbol: "USDT",
   *           decimals: 6
   *        },
   *        status: {
   *           state: "Period Expired",
   *           latestChallengeBy: null,
   *           latestSettlementOfferBy: null,
   *           claimed: false
   *        },
   *        amount: "2379300000",
   *        total: "2379300000",
   *        displayableAmount: "2379.3",
   *        amountBI: "2379.3"
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

/**
 * Information about the latest settlement offer
 */
export interface ISettlement {
  /** Address of who sent the latest offer */
  latestSettlementOfferAddress: string;

  /** Buyer's share submitted in the offer */
  latestSettlementOfferBuyer: number;

  /** Seller's share submitted in the offer */
  latestSettlementOfferSeller: number;
}

/**
 * Information about arbitrator or arbitrator proposal
 */
export interface IArbitratorInfo {
  /** Arbitrator. Null if no arbitrator was set or proposed */
  arbitrator: string | null;

  /** Seller's agreement on the arbitrator (false for no arbitrator or if arbitrator was only proposed by the buyer) */
  consensusSeller: boolean;

  /** Buyer's agreement on the arbitrator (false for no arbitrator or if arbitrator was only proposed by the seller) */
  consensusBuyer: boolean;

  /** Has the escrow been decided by the arbitrator */
  arbitrated: boolean;

  /** Arbitrator's fee (%, can be 0) */
  arbitratorFee: number;
}

export interface IGetConnectedUser {
  buyer: string;
  seller: string;
  arbitrator: string | null;
  marketplace: string | null;
}

/**
 * All data of an escrow incl. info about the arbitrator, settlement and a role of the connected user.
 */
export interface IGetEscrowData extends Omit<IEscrowData, "tokenAddress"> {
  /** Information about the token used in the payment */
  token: IToken;

  /** Information about arbitrator or arbitrator proposal */
  arbitration: IArbitratorInfo | null;

  /** Information about the latest settlement offer (if any) */
  settlement: ISettlement | null;

  /** User's role in the escrow ('buyer' | 'seller' | 'arbitrator' | 'marketplace' | 'other') */
  connectedUser?: tConnectedUser;

  /** Address of the connected user */
  walletAddress?: string;
}

export interface ISettlementOfferModalProps {
  /** ID of the escrow that the transaction created or acted upon */
  escrowId: number;
  escrowData?: IGetEscrowData;
  deferredPromise: Deferred<any>;
  callbacks?: ISettlementOfferTransactionCallbacks;
}

export interface ISettlementApproveModalProps {
  /** ID of the escrow that the transaction created or acted upon */
  escrowId: number;
  escrowData?: IGetEscrowData;
  deferredPromise: Deferred<any>;
  callbacks?: ISettlementApproveTransactionCallbacks;
}
export interface IArbitrateModalProps {
  /** ID of the escrow that the transaction created or acted upon */
  escrowId: number;
  deferredPromise: Deferred<any>;
  callbacks?: IArbitrateTransactionCallbacks;
}

/**
 * The info needed for calculating the status of an escrow.
 */
export interface ICalculateStatusParams {
  /** Whom is the payment for */
  seller: string;

  /** Buyer's consensus about the escrow */
  consensusBuyer: number;

  /** Seller's consensus about the escrow */
  consensusSeller: number;

  /** Seller's "gross" share (without deducting fees) in % */
  splitSeller: number;

  /** Buyer's share in % (buyer + seller = 100) */
  splitBuyer: number;

  /** When does a challenge period end */
  expires: Date;

  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean;

  /** Address of who sent the latest settlement offer. */
  latestSettlementOfferAddress?: string;
}

/**
 * Input for calculating final amounts to be sent to each party from the escrow
 */
export interface CalculateAmountsInput {
  /** Total payment amount in ETH's or token's WEI */
  amount: bigint;

  /** Buyer's gross share in % */
  splitBuyer: number;

  /** Seller's gross share in % */
  splitSeller: number;

  /** Protocol fee in % */
  splitProtocol: number;

  /** Marketplace fee in % */
  splitMarketplace: number;

  /** Arbitrator fee in % */
  arbitratorFee?: number;
}

/**
 * Final amounts (in WEI) sent to each party if the escrow was claimed in the defined state
 */
export interface tShares {
  amountBuyer: bigint;
  amountSeller: bigint;
  amountProtocol: bigint;
  amountMarketplace: bigint;
  amountArbitrator: bigint;
}

export interface tSplits {
  /** Buyer's final share in percentage incl. fees */
  splitBuyer: number;
  /** Seller's final share in percentage incl. fees */
  splitSeller: number;
  /** Protocol's final share in percentage incl. fees */
  splitProtocol: number;
  /** Marketplace's final share in percentage incl. fees */
  splitMarketplace: number;
  /** Arbitrator's final share in percentage incl. fees */
  splitArbitrator: number;
}

export type CalculateFunction = CalculateAmountsInput;

export type DefaultNetwork = "arbitrum" | "development" | "arbitrumSepolia";

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
