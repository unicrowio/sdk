import { UnicrowPrimaryTokensList__factory } from '@unicrowio/ethers-types'
import { CROW_LIST_TOKENS } from '../config'
import { IToken } from '../typing'
import { getJsonRpcProvider } from './getJsonRpcProvider'

/**
 * Returns a list of all escrow earning tokens.
 *
 * @returns {Promise<IToken[]>}
 */
export const getEscrowEarningTokens = async (): Promise<IToken[]> => {
  // const unicrowListTokensContract = UnicrowPrimaryTokensList__factory.connect(
  //   CROW_LIST_TOKENS,
  //   getJsonRpcProvider()
  // )

  // return unicrowListTokensContract.getTokens().then((tokenMatrix: any) =>
  //   tokenMatrix.map((token: string[]) => {
  //     const symbol = token[0]
  //     const address = token[1]

  //     return {
  //       symbol,
  //       address
  //     }
  //   })
  // )
  return []
}
