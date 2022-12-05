import { getPaymentList } from './getPaymentList'
import { GraphQLClient } from 'graphql-request'
import { IndexerInstance, IPage, TPaymentListQueryParams } from '../typing'
import { getSinglePayment } from './getSinglePayment'
import { getUserBalance } from './getUserBalance'
import { getClaimableEscrows } from './getClaimableEscrows'

export const getInstance = (url: string): IndexerInstance => {
  const client = new GraphQLClient(url)

  return {
    getPaymentList: (
      queryParams: TPaymentListQueryParams,
      pagination: IPage
    ) => {
      return getPaymentList(client, queryParams, pagination)
    },
    getSinglePayment: (escrowId: number) => {
      return getSinglePayment(client, escrowId)
    },
    getUserBalance: (walletUserAddress: string) => {
      return getUserBalance(client, walletUserAddress)
    },
    getClaimableEscrows: (walletUserAddress: string) => {
      return getClaimableEscrows(client, walletUserAddress)
    }
  }
}
