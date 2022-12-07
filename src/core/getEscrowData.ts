import { BigNumber } from 'ethers'
import { BigNumber as BigNumberJs } from 'bignumber.js'
import { UNICROW_ADDRESS } from '../config'
import {
  ADDRESS_ZERO,
  NULL_MARKETPLACE_ADDRESS,
  consensus
} from '../helpers/constants'
import { calculateStatus } from './calculateStatus'
import {
  IArbitratorParsed,
  tConnectedUser,
  IEscrowData,
  IGetConnectedUser,
  IGetEscrowData,
  ISettlementParsed,
  ITokenParsed
} from '../typing'
import { Unicrow__factory } from '@unicrowio/ethers-types'
import { getWeb3Provider, getWalletAccount } from '../wallet'
import { bipsToPercentage, isSameAddress } from '../helpers'
import {
  DataStructOutput,
  SettlementStructOutput,
  TokenStruct
} from '@unicrowio/ethers-types/src/Unicrow'
import { ArbitratorStructOutput } from '@unicrowio/ethers-types/src/IUnicrowArbitrator'
import { EscrowStructOutput } from '@unicrowio/ethers-types/src/IUnicrow'

const getConnectedUser = async ({
  buyer,
  seller,
  arbitrator,
  marketplace
}: IGetConnectedUser) => {
  const connectedWallet = await getWalletAccount()
  let connectedUser: tConnectedUser | undefined
  if (isSameAddress(connectedWallet, buyer)) {
    connectedUser = 'buyer'
  } else if (isSameAddress(connectedWallet, seller)) {
    connectedUser = 'seller'
  } else if (!!arbitrator && isSameAddress(connectedWallet, arbitrator)) {
    connectedUser = 'arbitrator'
  } else if (isSameAddress(connectedWallet, marketplace)) {
    connectedUser = 'marketplace'
  } else {
    connectedUser = 'other'
  }

  return { connectedUser, connectedWallet }
}

const parseArbitration = (
  data: ArbitratorStructOutput
): IArbitratorParsed | null => {
  if (data.arbitrator === ADDRESS_ZERO) return null
  return {
    arbitrator: data.arbitrator,
    consensusSeller: data.sellerConsensus,
    consensusBuyer: data.buyerConsensus,
    arbitrated: data.arbitrated,
    arbitratorFee: bipsToPercentage([data.arbitratorFee])[0]
  }
}

const parseEscrow = (
  escrowId: number,
  data: EscrowStructOutput,
  latestSettlementOfferAddress?: string
): IEscrowData => {
  const [
    percentageBuyer,
    percentageSeller,
    percentageMarketplace,
    percentageUnicrow
  ] = bipsToPercentage(data.split)

  const seller: string = data.seller
  const buyer: string = data.buyer
  const challengePeriodStart: Date = new Date(
    data.challengePeriodStart.toNumber() * 1000
  )
  const challengePeriodEnd: Date = new Date(
    data.challengePeriodEnd.toNumber() * 1000
  )
  const tokenAddress: string = data.currency
  const challengePeriod: number = data.challengeExtension.toNumber()
  const amount: BigNumber = data.amount

  // Consensus
  const consensusBuyer: number = data.consensus[consensus.BUYER]
  const consensusSeller: number = data.consensus[consensus.SELLER]

  const splitProtocol: number = percentageUnicrow
  const splitBuyer: number = percentageBuyer
  const splitSeller: number = percentageSeller
  const splitMarketplace: number = percentageMarketplace

  const claimed = Boolean(data.claimed)
  const marketplace: string = data.marketplace.toString()

  const amountBigNumberJs = new BigNumberJs(amount.toString())

  const status = calculateStatus({
    seller,
    consensusBuyer,
    consensusSeller,
    splitSeller,
    splitBuyer,
    expires: challengePeriodEnd,
    claimed,
    latestSettlementOfferAddress
  })

  return {
    challengePeriod,
    challengePeriodStart,
    challengePeriodEnd,
    status,
    escrowId,
    amount: amountBigNumberJs,
    // Addresses
    marketplace: marketplace === NULL_MARKETPLACE_ADDRESS ? null : marketplace,
    buyer,
    seller,
    tokenAddress,
    // Splits
    splitMarketplace,
    splitBuyer,
    splitSeller,
    splitProtocol,
    // Consensus
    consensusBuyer,
    consensusSeller
  }
}

const parseSettlement = (
  data: SettlementStructOutput
): ISettlementParsed | null => {
  if (data.latestSettlementOfferBy === ADDRESS_ZERO) return null

  const [latestSettlementOfferBuyer, latestSettlementOfferSeller] =
    bipsToPercentage(data.latestSettlementOffer)

  return {
    latestSettlementOfferAddress: data.latestSettlementOfferBy,
    latestSettlementOfferBuyer,
    latestSettlementOfferSeller
  }
}

const parseToken = (data: TokenStruct): ITokenParsed | null => {
  // is ETH
  if (data.address_ === ADDRESS_ZERO)
    return {
      tokenAddress: ADDRESS_ZERO,
      decimals: 18,
      symbol: 'ETH'
    }

  // is ERC-20
  return {
    tokenAddress: data.address_,
    symbol: data.symbol,
    decimals: Number(data.decimals.toString()) // TODO fix build temporary: data.decimals.toNumber()
  }
}

const parse = (escrowId: number, data: DataStructOutput): any => {
  const arbitration: IArbitratorParsed | null = parseArbitration(
    data.arbitrator
  )

  const settlement: ISettlementParsed | null = parseSettlement(data.settlement)
  const token: ITokenParsed | null = parseToken(data.token)
  const escrow: IEscrowData = parseEscrow(
    escrowId,
    data.escrow,
    settlement?.latestSettlementOfferAddress
  )

  return {
    escrow,
    token,
    arbitration,
    settlement
  }
}

/**
 * Get all information about an escrow:
 * - Escrow details
 * - Token
 * - Arbitration
 * - Settlement
 *
 * Returns null if some data, like arbitration or settlement, doesn't exist.
 *
 * @async
 * @example TODO:
 * - one with no arbitrator, settlement, or token data (when ETH was used)
 * - one with arbitrator added, payment settled by the arbitrator, and with token (e.g. DAI) info
 * @param number escrowId
 * @throws Error
 * If escrow id doesn't exist.
 * @returns {Promise<IGetEscrowData>}
 */
export const getEscrowData = async (
  escrowId: number
): Promise<IGetEscrowData> => {
  const provider = await getWeb3Provider()

  const Unicrow = Unicrow__factory.connect(UNICROW_ADDRESS, provider)

  const allEscrowData: DataStructOutput = await Unicrow.getAllEscrowData(
    escrowId
  )

  if (allEscrowData.escrow.buyer === ADDRESS_ZERO) {
    throw new Error(`EscrowId: ${escrowId} doesn't exist`)
  }

  const { escrow, token, arbitration, settlement } = parse(
    escrowId,
    allEscrowData
  )

  const { connectedUser, connectedWallet } = await getConnectedUser({
    buyer: escrow.buyer === ADDRESS_ZERO ? null : escrow.buyer,
    seller: escrow.seller,
    arbitrator: arbitration?.arbitrator,
    marketplace: escrow?.marketplace
  })

  return {
    ...escrow,
    token,
    arbitration,
    settlement,
    connectedUser,
    connectedWallet
  }
}
