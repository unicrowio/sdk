import { IQuery } from '../indexer/queryBuilder'
import Deferred from '../helpers/deferred'
import { BigNumber as BigNumberJs } from 'bignumber.js'

export type TokenSymbol = 'DAI' | 'USDT' | 'USDC' | 'ETH' | string

/**
 * @field TokenSymbol symbol ('DAI' | 'USDT' | 'USDC' | 'ETH' | string)
 * @field string address
 */
export interface IToken {
  symbol: TokenSymbol
  address: string
}

/**
 * @field string | BigNumber | number amount
 * @field string seller
 * @field number challengePeriod
 * @field string tokenAddress (optional)
 * @field string marketplace (optional)
 * @field number marketplaceFee (optional)
 * @field string arbitrator (optional)
 * @field number arbitratorFee (optional)
 * @field number challengePeriodExtension (optional)
 */
export interface IPaymentProps {
  /** Amount in token */
  amount: string | BigNumberJs | number
  /** Whom is the payment for */
  seller: string
  /** Initial challenge period (in seconds) */
  challengePeriod: number
  tokenAddress?: string
  /** address of a marketplace that has facilitated the payment */
  marketplace?: string
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee?: number
  /** Address of the arbitrator. 0x00..00 for no arbitrator */
  arbitrator?: string
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee?: number
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension?: number
}

export interface IArbitratorData {
  address: string
  fee: number
}

export interface IArbitrateData {
  splitBuyer: number
  splitSeller: number
}

export enum EscrowStatus {
  UNPAID = 'Unpaid',
  PAID = 'Paid',
  RELEASED = 'Released',
  PERIOD_EXPIRED = 'Period Expired',
  REFUNDED = 'Refunded',
  CHALLENGED = 'Challenged',
  SETTLED = 'Settled'
}

export type EscrowStatusLatestParty = 'buyer' | 'seller' | null

/**
 * @field EscrowStatus state (PAID | UNPAID | RELEASED | PERIOD_EXPIRED | REFUNDED | CHALLENGED | SETTLED)
 * @field boolean claimed
 * @field EscrowStatusLatestParty latestChallenge ('buyer' | 'seller' | null)
 * @field EscrowStatusLatestParty latestSettlementOffer ('buyer' | 'seller' | null)
 */
export interface IEscrowStatus {
  state: EscrowStatus
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean
  latestChallenge: EscrowStatusLatestParty
  /** how the payment was offered to be settled [buyer, seller] in bips */
  latestSettlementOffer: EscrowStatusLatestParty
}

export interface EscrowStatusView {
  amount: BigNumberJs // ERC20 | Ether
  escrow_id: number
  status: keyof typeof EscrowStatus

  // Addresses
  marketplace: string | null
  buyer: string
  seller: string
  currency: string

  challenge_period: number
  challenge_period_start: number
  challenge_period_end: number

  // Split
  split_seller: number
  split_buyer: number
  split_protocol: number
  split_marketplace: number

  // Consensus
  consensus_seller: number
  consensus_buyer: number

  claimed: boolean

  paid_at: number

  arbitrated: boolean
  arbitrator_fee?: number

  latest_settlement_offer_address?: string
  latest_settlement_offer_seller?: number
  latest_settlement_offer_buyer?: number
}

/**
 * @field string tokenAddress
 * @field string symbol
 * @field number decimals
 */
export interface ITokenInfo {
  tokenAddress: string
  symbol: string
  decimals: number
}

export interface IEscrowData {
  amount: BigNumberJs // ERC20 | Ether
  escrowId: number

  status: IEscrowStatus

  // Addresses
  marketplace: string | null
  buyer: string
  seller: string
  tokenAddress: string

  challengePeriod: number
  challengePeriodStart: Date
  challengePeriodEnd: Date

  // Split
  splitBuyer: number
  splitSeller: number
  splitProtocol: number
  splitMarketplace: number

  // Consensus
  consensusBuyer: number
  consensusSeller: number

  createdAt?: Date

  // Settlement
  latestSettlementOfferAddress?: string
  latestSettlementOfferSeller?: number
  latestSettlementOfferBuyer?: number
}

export interface IEscrowDataWithTokenInfo extends IEscrowData {
  tokenInfo: ITokenInfo
}

export interface IBalance {
  amount: string
  amountInUSD: string
  tokenSymbol: TokenSymbol
  status: 'Pending' | 'Ready for claim'
}

export interface IBalanceResponse {
  pending: IBalance[]
  readyForClaim: IBalance[]
}

export interface GenericParsedTxPayload {
  name: string
  transactionHash: string
  blockNumber: number
  escrowId: number
}

/**
 * @field string arbitrator
 * @field number arbitratorFee
 * @field 'ArbitratorApproved' statusArbitration
 */
export type ApproveArbitratorParsedPayload = GenericParsedTxPayload & {
  /** Address of the arbitrator. 0x00..00 for no arbitrator */
  arbitrator: string
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number
  /** Has the escrow been decided by the arbitrator, false if value === null // TODO: verify if true */
  statusArbitration: 'ArbitratorApproved'
}

/**
 * @field Date settledAt
 * @field number latestSettlementOfferBuyer
 * @field number latestSettlementOfferSeller
 * @field string buyer
 * @field string seller
 * @field number challengePeriodExtension
 * @field Date challengePeriodStart
 * @field Date challengePeriodEnd
 * @field string marketplace
 * @field number marketplaceFee
 * @field string currency
 * @field boolean claimed
 * @field number consensusBuyer
 * @field number consensusSeller
 * @field number splitBuyer
 * @field number splitSeller
 * @field number splitMarketplace
 * @field number splitProtocol
 * @field string amount
 * @field string amountBuyer
 * @field string amountSeller
 * @field string amountMarketplace
 * @field string amountProtocol
 * @field string amountArbitrator
 */
export type ApproveSettlementParsedPayload = GenericParsedTxPayload & {
  settledAt: Date
  latestSettlementOfferBuyer: number
  latestSettlementOfferSeller: number
  /** Who sent the payment */
  buyer: string
  /** Whom is the payment for */
  seller: string
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date
  /** address of a marketplace that has facilitated the payment */
  marketplace: string
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number
  /** Token used in the payment (0x00..00 for ETH) */
  currency: string
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number
  /** Seller's agreement on the arbitrator */
  consensusSeller: number
  splitBuyer: number
  splitSeller: number
  splitMarketplace: number
  splitProtocol: number
  /** Amount in token */
  amount: string
  amountBuyer: string
  amountSeller: string
  amountMarketplace: string
  amountProtocol: string
  amountArbitrator: string
}

/**
 * @field Date settledAt
 * @field string buyer
 * @field string seller
 * @field number challengePeriodExtension
 * @field Date challengePeriodStart
 * @field Date challengePeriodEnd
 * @field string marketplace
 * @field number marketplaceFee
 * @field string currency
 * @field boolean claimed
 * @field number consensusBuyer
 * @field number consensusSeller
 * @field number splitBuyer
 * @field number splitSeller
 * @field number splitMarketplace
 * @field number splitProtocol
 * @field string amount
 * @field string amountBuyer
 * @field string amountSeller
 * @field string amountMarketplace
 * @field string amountProtocol
 * @field string amountArbitrator
 */
export type ArbitrateParsedPayload = GenericParsedTxPayload & {
  settledAt: Date
  /** Who sent the payment */
  buyer: string
  /** Whom is the payment for */
  seller: string
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date
  /** address of a marketplace that has facilitated the payment */
  marketplace: string
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number
  /** Token used in the payment (0x00..00 for ETH) */
  currency: string
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number
  /** Seller's agreement on the arbitrator */
  consensusSeller: number
  splitBuyer: number
  splitSeller: number
  splitMarketplace: number
  splitProtocol: number
  /** Amount in token */
  amount: string
  amountBuyer: string
  amountSeller: string
  amountMarketplace: string
  amountProtocol: string
  amountArbitrator: string
}

/**
 * @field Date challengedAt
 * @field string buyer
 * @field string seller
 * @field number challengePeriodExtension
 * @field Date challengePeriodStart
 * @field Date challengePeriodEnd
 * @field string marketplace
 * @field number marketplaceFee
 * @field string currency
 * @field boolean claimed
 * @field number consensusBuyer
 * @field number consensusSeller
 * @field number splitBuyer
 * @field number splitSeller
 * @field number splitMarketplace
 * @field number splitProtocol
 * @field string amount
 */
export type ChallengeParsedPayload = GenericParsedTxPayload & {
  challengedAt: Date
  /** Who sent the payment */
  buyer: string
  /** Whom is the payment for */
  seller: string
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date
  /** address of a marketplace that has facilitated the payment */
  marketplace: string
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number
  /** Token used in the payment (0x00..00 for ETH) */
  currency: string
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number
  /** Seller's agreement on the arbitrator */
  consensusSeller: number
  splitBuyer: number
  splitSeller: number
  splitMarketplace: number
  splitProtocol: number
  /** Amount in token */
  amount: string
}

export type SingleClaimParsedPayload = GenericParsedTxPayload & {
  amountBuyer: string
  amountSeller: string
  amountMarketplace: string
  amountProtocol: string
  amountArbitrator: string
}

/**
 * @field SingleClaimParsedPayload[] payload (array with amountBuyer, amountSeller, amountMarketplace, amountProtocol, amountArbitrator)
 */
export type ClaimParsedPayload = GenericParsedTxPayload & {
  payload: SingleClaimParsedPayload[]
}

/**
 * @field Date settlementOfferAt
 * @field number latestSettlementOfferBuyer
 * @field number latestSettlementOfferSeller
 * @field string latestSettlementOfferAddress
 */
export type OfferSettlementParsedPayload = GenericParsedTxPayload & {
  settlementOfferAt: Date
  latestSettlementOfferBuyer: number
  latestSettlementOfferSeller: number
  latestSettlementOfferAddress: string
}

/**
 * @field Date paidAt
 * @field string arbitrator
 * @field number arbitratorFee
 * @field string buyer
 * @field string seller
 * @field number challengePeriod
 * @field number challengePeriodExtension
 * @field Date challengePeriodStart
 * @field Date challengePeriodEnd
 * @field string marketplace
 * @field number marketplaceFee
 * @field string currency
 * @field boolean claimed
 * @field number consensusBuyer
 * @field number consensusSeller
 * @field number splitBuyer
 * @field number splitSeller
 * @field number splitMarketplace
 * @field number splitProtocol
 * @field string amount
 * @field string amountBuyer
 * @field string amountSeller
 * @field string amountMarketplace
 * @field string amountProtocol
 * @field string amountArbitrator
 */
export type PayParsedPayload = GenericParsedTxPayload & {
  paidAt: Date
  /** Address of the arbitrator. 0x00..00 for no arbitrator */
  arbitrator: string
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number
  /** Who sent the payment */
  buyer: string
  /** Whom is the payment for */
  seller: string
  /** Initial challenge period (in seconds) */
  challengePeriod: number
  /** By how much will the challenge period get extended after a challenge (in seconds) */
  challengePeriodExtension: number
  /** When does the current challenge period start (seconds in Unix epoch) */
  challengePeriodStart: Date
  /** When does the current challenge period end (seconds in Unix epoch) */
  challengePeriodEnd: Date
  /** address of a marketplace that has facilitated the payment */
  marketplace: string
  /** Fee for the marketplace (can be 0 even if a marketplace was set but doesn't charge fee)  */
  marketplaceFee: number
  /** Token used in the payment (0x00..00 for ETH) */
  currency: string
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number
  /** Seller's agreement on the arbitrator */
  consensusSeller: number
  splitBuyer: number
  splitSeller: number
  splitMarketplace: number
  splitProtocol: number
  /** Amount in token */
  amount: string
  amountBuyer: string
  amountSeller: string
  amountMarketplace: string
  amountArbitrator: string
  amountProtocol: string
}

/**
 * @field string arbitrator
 * @field number arbitratorFee
 * @field string proposer
 * @field 'ArbitratorProposed' amountMarketplace
 */
export type ProposalArbitratorParsedPayload = GenericParsedTxPayload & {
  /** Address of the arbitrator. 0x00..00 for no arbitrator */
  arbitrator: string
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number
  proposer: string
  statusArbitration: 'ArbitratorProposed'
}

export type ReleaseParsedPayload = GenericParsedTxPayload & {
  releasedAt: Date
  buyer: string
  seller: string
  challengePeriodExtension: number
  challengePeriodStart: Date
  challengePeriodEnd: Date
  marketplace: string
  marketplaceFee: number
  currency: string
  claimed: boolean
  consensusBuyer: number
  consensusSeller: number
  splitBuyer: number
  splitSeller: number
  splitMarketplace: number
  splitProtocol: number
  amount: string
  amountBuyer: string
  amountSeller: string
  amountMarketplace: string
  amountProtocol: string
  amountArbitrator: string
}

export interface IGenericTransactionCallbacks {
  connectingWallet?: (payload?: any) => void
  connected?: (payload?: any) => void
  broadcasting?: (payload?: any) => void
  broadcasted?: (payload: any) => void
  confirmed?: (payload: any) => void
}

export interface IPayTransactionPayload {
  transactionHash: string
  name?: string
  blockNumber?: number
  escrowId?: number
  arbitratorFee?: number
  paidAt?: Date
  arbitrator?: string
  buyer?: string
  seller?: string
  challengePeriod?: number
  challengePeriodExtension?: number
  challengePeriodStart?: Date
  challengePeriodEnd?: Date
  marketplace?: string
  marketplaceFee?: number
  currency?: string
  claimed?: boolean
  consensusBuyer?: number
  consensusSeller?: number
  splitBuyer?: number
  splitSeller?: number
  splitMarketplace?: number
  splitProtocol?: number
  amount?: string
  amountBuyer?: string
  amountSeller?: string
  amountMarketplace?: string
  amountArbitrator?: string
  amountProtocol?: string
}

/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface IPayTransactionCallbacks extends IGenericTransactionCallbacks {
  broadcasted?: (data: IPayTransactionPayload) => void
  confirmed?: (data: IPayTransactionPayload) => void
}

export type IReleasedTransactionPayload = ReleaseParsedPayload

export interface IReleasedTransactionBroadcastPayload {
  transactionHash: string
}
/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface IReleaseTransactionCallbacks
  extends IGenericTransactionCallbacks {
  broadcasted?: (data: IReleasedTransactionBroadcastPayload) => void
  confirmed?: (data: IReleasedTransactionPayload) => void
}

export interface ISettlementTransactionPayload {
  transactionHash: string
  splitBuyer: number
  splitSeller: number
}

/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface ISettlementApproveTransactionCallbacks
  extends IGenericTransactionCallbacks {
  broadcasted?: (data: ISettlementTransactionPayload) => void
  confirmed?: (data: ApproveSettlementParsedPayload) => void
}

/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface ISettlementOfferTransactionCallbacks
  extends IGenericTransactionCallbacks {
  broadcasted?: (data: ISettlementTransactionPayload) => void
  confirmed?: (data: OfferSettlementParsedPayload) => void
}

export interface IAddArbitratorTransactionPayload {
  transactionHash: string
}

export interface IChallengeTransactionPayload {
  transactionHash: string
}

/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface IChallengeTransactionCallbacks
  extends IGenericTransactionCallbacks {
  broadcasted?: (data: IChallengeTransactionPayload) => void
  confirmed?: (data: IChallengeTransactionPayload) => void
}

export interface IArbitrationTransactionPayload {
  transactionHash: string
  arbitrator: string
  arbitratorFee: number
}

export interface IArbitrateTransactionPayload {
  transactionHash: string
  splitBuyer: number
  splitSeller: number
}

/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface IArbitrationTransactionCallbacks
  extends IGenericTransactionCallbacks {
  broadcasted?: (
    data: IArbitrationTransactionPayload | IArbitrateTransactionPayload
  ) => void
  confirmed?: (
    data:
      | ProposalArbitratorParsedPayload
      | ApproveArbitratorParsedPayload
      | ArbitrateParsedPayload
  ) => void
}

export interface IRefundTransactionPayload {
  transactionHash: string
}

/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface IRefundTransactionCallbacks
  extends IGenericTransactionCallbacks {
  broadcasted?: (data: IRefundTransactionPayload) => void
  confirmed?: (data: IRefundTransactionPayload) => void
}

export interface IClaimTransactionPayload {
  transactionHash: string
}

/**
 * @field function broadcasted (optional)
 * @field function confirmed (optional)
 */
export interface IClaimTransactionCallbacks
  extends IGenericTransactionCallbacks {
  broadcasted?: (data: IClaimTransactionPayload) => void
  confirmed?: (data: IClaimTransactionPayload) => void
}
export interface IPaymentModalProps {
  paymentRequestData: IPaymentProps
  deferredPromise: Deferred<any>
  callbacks?: IPayTransactionCallbacks
}

export interface IReleaseModalProps {
  escrowId: number
  deferredPromise: Deferred<any>
  callbacks?: IReleaseTransactionCallbacks
}

export interface IRefundModalProps {
  escrowId: number
  deferredPromise: Deferred<any>
  callbacks?: IRefundTransactionCallbacks
}

export interface IChallengeModalProps {
  escrowId: number
  deferredPromise: Deferred<any>
  callbacks?: IChallengeTransactionCallbacks
}

export interface IArbitrationModalProps {
  escrowId: number
  deferredPromise: Deferred<any>
  callbacks?: IArbitrationTransactionCallbacks
}

export type TBalance = {
  token: string
  status: 'Ready to Claim' | 'Pending'
  total: BigNumberJs
}

export type tConnectedUser =
  | 'buyer'
  | 'seller'
  | 'arbitrator'
  | 'marketplace'
  | 'other'

/**
 * @field string tokenAddress (optional)
 * @field string symbol (optional)
 * @field function decimals (optional)
 * @field string | BigNumber displayableAmount
 * @field BigNumber amountBN
 * @field tConnectedUser connectedUser ("buyer" | "seller" | "arbitrator" | "marketplace" | "other")
 * @field string connectedWallet
 * @field IEscrowStatus statusEscrow (PAID | UNPAID | RELEASED | PERIOD_EXPIRED | REFUNDED | CHALLENGED | SETTLED)
 */
export interface IBalanceWithTokenInfo extends TBalance {
  tokenAddress?: string
  symbol?: string
  decimals?: number
  displayableAmount: string | BigNumberJs
  amountBN: BigNumberJs
  connectedUser: tConnectedUser
  connectedWallet: string
  /** Indicates status of the payment */
  statusEscrow: IEscrowStatus
}
/**
 * @field IBalanceWithTokenInfo[] pending
 * @field IBalanceWithTokenInfo[] readyForClaim
 */
export interface GetResponseUserBalance {
  pending: IBalanceWithTokenInfo[]
  readyForClaim: IBalanceWithTokenInfo[]
}

export interface IClaimModalProps {
  walletsToClaim: string[]
  balances: GetResponseUserBalance
  deferredPromise: Deferred<any>
  callbacks?: IClaimTransactionCallbacks
}

export interface ISingleClaimModalProps {
  escrowId: number
  deferredPromise: Deferred<any>
  callbacks?: IClaimTransactionCallbacks
}

export type TPaymentListQueryParams = IQuery

export interface IPage {
  limit: number
  page: number
}

export interface IGetPaymentListResponse {
  totalCount: number
  data: IEscrowData[]
}

export interface IndexerInstance {
  getPaymentList: (
    queryParams: TPaymentListQueryParams,
    pagination: IPage
  ) => Promise<IGetPaymentListResponse>
  getSinglePayment: (escrowId: number) => Promise<IEscrowData | null>
  getUserBalance: (walletUserAddress: string) => Promise<GetResponseUserBalance>
  getClaimableEscrows: (walletUserAddress: string) => Promise<string[]>
}

export interface IArbitratorContractData {
  arbitrated: boolean
  consensusBuyer: boolean
  consensusSeller: boolean
  arbitrator: string
  arbitratorFee: string
}

/**
 * @field string latestSettlementOfferAddress
 * @field number latestSettlementOfferBuyer
 * @field number latestSettlementOfferSeller
 */
export interface ISettlementParsed {
  /** address of who sent the latest settlement offer. Returns 0x00..00 if no offer has been made */
  latestSettlementOfferAddress: string
  latestSettlementOfferBuyer: number
  latestSettlementOfferSeller: number
}

/**
 * @field string arbitrator
 * @field boolean consensusSeller
 * @field boolean consensusBuyer
 * @field boolean arbitrated
 * @field number arbitratorFee
 */
export interface IArbitratorParsed {
  /** Address of the arbitrator. 0x00..00 for no arbitrator */
  arbitrator: string
  /** Seller's agreement on the arbitrator */
  consensusSeller: boolean
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: boolean
  /** Has the escrow been decided by the arbitrator */
  arbitrated: boolean
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee: number
}

/**
 * @field string tokenAddress
 * @field number decimals
 * @field string symbol
 */
export interface ITokenParsed {
  tokenAddress: string
  decimals: number
  symbol: string
}

export type IGetConnectedUser = {
  buyer: string
  seller: string
  arbitrator: string | null
  marketplace: string | null
}

/**
 * @field ITokenParsed token (interface with tokenAddress, decimals, symbol)
 * @field IArbitratorParsed | null arbitration (interface with arbitrator, consensusSeller, consensusBuyer, arbitrated, arbitratorFee)
 * @field ISettlementParsed | null settlement (interface with latestSettlementOfferAddress, latestSettlementOfferBuyer, latestSettlementOfferSeller)
 * @field tConnectedUser connectedUser ("buyer" | "seller" | "arbitrator" | "marketplace" | "other")
 * @field string connectedWallet
 */
export interface IGetEscrowData extends IEscrowData {
  token: ITokenParsed
  arbitration: IArbitratorParsed | null
  settlement: ISettlementParsed | null
  connectedUser: tConnectedUser
  connectedWallet: string
}

export interface ISettlementOfferModalProps {
  escrowId: number
  escrowData?: IGetEscrowData
  deferredPromise: Deferred<any>
  callbacks?: ISettlementOfferTransactionCallbacks
}

export interface ISettlementApproveModalProps {
  escrowId: number
  escrowData?: IGetEscrowData
  deferredPromise: Deferred<any>
  callbacks?: ISettlementApproveTransactionCallbacks
}
export interface IArbitrateModalProps {
  escrowId: number
  deferredPromise: Deferred<any>
  callbacks?: IArbitrationTransactionCallbacks
}

/**
 * @field string seller
 * @field number consensusBuyer
 * @field number consensusSeller
 * @field number splitSeller
 * @field number splitBuyer
 * @field Date expires
 * @field boolean claimed
 * @field string latestSettlementOfferAddress (optional)
 *
 */
export interface ICalculateStatusParams {
  /** Whom is the payment for */
  seller: string
  /** Buyer's agreement on the arbitrator */
  consensusBuyer: number
  /** Seller's agreement on the arbitrator */
  consensusSeller: number
  splitSeller: number
  splitBuyer: number
  expires: Date
  /** True if the payment was already withdrawn from the escrow */
  claimed: boolean
  latestSettlementOfferAddress?: string
}

/**
 * @field number amount
 * @field number splitBuyer
 * @field number splitSeller
 * @field number splitProtocol
 * @field number splitMarketplace
 * @field number arbitratorFee (optional)
 */
export type CalculateAmountsInput = {
  amount: number
  splitBuyer: number
  splitSeller: number
  splitProtocol: number
  splitMarketplace: number
  /** Arbitrator's fee in bips. Can be 0 */
  arbitratorFee?: number
}

/**
 * @field number amountBuyer
 * @field number amountSeller
 * @field number amountProtocol
 * @field number amountMarketplace
 * @field number amountArbitrator
 */
export type Shares = {
  amountBuyer: number
  amountSeller: number
  amountProtocol: number
  amountMarketplace: number
  amountArbitrator: number
}

export type Splits = {
  splitBuyer: BigNumberJs
  splitSeller: BigNumberJs
  splitProtocol: BigNumberJs
  splitMarketplace: BigNumberJs
  splitArbitrator: BigNumberJs
}

export type CalculateFunction = CalculateAmountsInput

export default {}
