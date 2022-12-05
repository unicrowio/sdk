import { getSplitFromLoggedUser } from '../helpers/calculateSplit'
import {
  displayableAmount,
  displayableAmountBN
} from '../helpers/displayAmount'
import BigNumber from 'bignumber.js'
import { IBalanceWithTokenInfo } from '../typing'
import { getEscrowData } from './getEscrowData'

/**
 * Gets balance of an escrow with its token info.
 *
 * @async
 * @param number escrowId
 * @returns {Promise<IBalanceWithTokenInfo>}
 */
export const getSingleBalance = async (
  escrowId: number
): Promise<IBalanceWithTokenInfo> => {
  const escrowData = await getEscrowData(escrowId)

  const amount = getSplitFromLoggedUser(
    {
      amount: escrowData.amount,
      split_buyer: escrowData.splitBuyer,
      split_seller: escrowData.splitSeller,
      split_protocol: escrowData.splitProtocol,
      split_marketplace: escrowData.splitMarketplace,
      buyer: escrowData.buyer,
      seller: escrowData.seller,
      marketplace: escrowData.marketplace,
      arbitrator_fee: escrowData.arbitration
        ? escrowData.arbitration.arbitratorFee
        : 0,
      arbitrated: escrowData.arbitration
        ? escrowData.arbitration.arbitrated
        : false
    },
    escrowData.connectedWallet
  )

  const amountBN = new BigNumber(amount)

  const balance: IBalanceWithTokenInfo = {
    tokenAddress: escrowData.token.tokenAddress,
    symbol: escrowData.token.symbol,
    decimals: escrowData.token.decimals,
    status: 'Ready to Claim',
    token: escrowData.token.tokenAddress,
    total: amountBN,
    amountBN: displayableAmountBN(amountBN, escrowData.token.decimals),
    displayableAmount: displayableAmount(amountBN, escrowData.token.decimals),
    connectedUser: escrowData.connectedUser,
    connectedWallet: escrowData.connectedWallet,
    statusEscrow: escrowData.status
  }

  return balance
}
