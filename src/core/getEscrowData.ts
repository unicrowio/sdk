import { BigNumber } from 'ethers'
import { BigNumber as BigNumberJs } from 'bignumber.js'
import { getContractAddress } from '../config'
import {
  ADDRESS_ZERO,
  NULL_MARKETPLACE_ADDRESS,
  consensus
} from '../helpers/constants'
import { calculateStatus } from './calculateStatus'
import {
  IArbitratorInfo,
  tConnectedUser,
  IEscrowData,
  IGetConnectedUser,
  IGetEscrowData,
  ISettlement,
  ITokenInfo
} from '../typing'

import { Unicrow__factory } from '@unicrowio/ethers-types'
import { getWeb3Provider, getWalletAccount, autoSwitchNetwork } from '../wallet'

import { bipsToPercentage, isSameAddress } from '../helpers'
import {
  DataStructOutput,
  SettlementStructOutput,
  TokenStruct
} from '@unicrowio/ethers-types/src/Unicrow'

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

const parseArbitration = (data): IArbitratorInfo | null => {
  if (data === null || data.arbitrator === ADDRESS_ZERO) return null
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
  data,
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

const parseSettlement = (data: SettlementStructOutput): ISettlement | null => {
  if (data.latestSettlementOfferBy === ADDRESS_ZERO) return null

  const [latestSettlementOfferBuyer, latestSettlementOfferSeller] =
    bipsToPercentage(data.latestSettlementOffer)

  return {
    latestSettlementOfferAddress: data.latestSettlementOfferBy,
    latestSettlementOfferBuyer,
    latestSettlementOfferSeller
  }
}

const parseToken = (data: TokenStruct): ITokenInfo | null => {
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
    decimals: Number(data.decimals)
  }
}

const parse = (escrowId: number, data: DataStructOutput): any => {
  const arbitration: IArbitratorInfo | null = parseArbitration(data.arbitrator)

  const settlement: ISettlement | null = parseSettlement(data.settlement)
  const token: ITokenInfo | null = parseToken(data.token)
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
 * @example TODO:
 * - one with no arbitrator, settlement, or token data (when ETH was used)
 * - one with arbitrator added, payment settled by the arbitrator, and with token (e.g. DAI) info
 * @throws Error
 * If escrow id doesn't exist.
 * @returns {Promise<IGetEscrowData>}
 */
export const getEscrowData = async (
  escrowId: number
): Promise<IGetEscrowData> => {
  const provider = await getWeb3Provider()

  if (!provider) {
    throw new Error('Error on Getting Escrow Data, Account Not connected')
  }

  autoSwitchNetwork()

  const Unicrow = Unicrow__factory.connect(
    getContractAddress('unicrow'),
    provider
  )

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
