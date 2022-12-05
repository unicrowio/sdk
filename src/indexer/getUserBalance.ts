import {
  displayableAmount,
  displayableAmountBN
} from '../helpers/displayAmount'
import { calculateSplit } from '../helpers/calculateSplit'
import { groupBy } from '../helpers/groupBy'
import { GraphQLClient } from 'graphql-request'
import { getTokenInfo } from '../core'
import {
  EscrowStatusView,
  GetResponseUserBalance,
  ITokenInfo,
  TBalance
} from '../typing'
import { buildBalanceQuery } from './queryBalance'

export const getUserBalance = async (
  client: GraphQLClient,
  walletUserAddress: string
): Promise<GetResponseUserBalance> => {
  const queryString = buildBalanceQuery(walletUserAddress)

  const response = await client.request<{
    pending: EscrowStatusView[]
    ready_for_claim: EscrowStatusView[]
  }>(queryString)

  const { pending, ready_for_claim } = response

  const groupByPending = groupBy(pending, item => item.currency)
  const groupByReady = groupBy(ready_for_claim, item => item.currency)

  const pendingData: TBalance[] = Object.keys(groupByPending)
    .map(key => {
      const group = groupByPending[key]
      const total = calculateSplit(group, walletUserAddress)
      return {
        token: key,
        status: 'Pending',
        total
      }
    })
    .filter((item: any) => item.total > 0) as TBalance[]

  const readyData: TBalance[] = Object.keys(groupByReady)
    .map(key => {
      const group = groupByReady[key]
      const total = calculateSplit(group, walletUserAddress)
      return {
        token: key,
        status: 'Ready to Claim',
        total
      }
    })
    .filter((item: any) => item.total > 0) as TBalance[]

  const tokensAddress = []
  for await (const balance of [...pendingData, ...readyData]) {
    const tokenInfo = await getTokenInfo(balance.token)
    tokensAddress.push(tokenInfo)
  }

  const uniqueTokensAddress = new Set(tokensAddress)

  const tokensInfo = await Promise.all(Array.from(uniqueTokensAddress))

  const resolve = (item: any) => {
    const _amount = item.total.div(1000)
    const tokenInfo = tokensInfo.find(
      t => t.tokenAddress === item.token
    ) as ITokenInfo
    return {
      ...item,
      total: _amount,
      displayableAmount: displayableAmount(_amount, tokenInfo.decimals),
      amountBN: displayableAmountBN(_amount, tokenInfo.decimals),
      ...tokenInfo
    }
  }

  const p = pendingData.map(item => resolve(item))
  const r = readyData.map(item => resolve(item))

  return {
    pending: p,
    readyForClaim: r
  }
}
