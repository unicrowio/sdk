import { Unicrow__factory } from '@unicrowio/ethers-types'
import { getContractAddress } from '../config'
import { bipsToPercentage } from '../helpers'
import { getJsonRpcProvider } from './getJsonRpcProvider'

/**
 * Retrieves information about the fee of Crow and returns its percentage.
 * If you need to use as BIPS, multiply by 100.
 *
 * @returns {number}
 */
export const getProtocolFee = async () => {
  const smartContract = Unicrow__factory.connect(
    getContractAddress('unicrow'),
    getJsonRpcProvider()
  )

  const fee = await smartContract.protocolFee()

  const [feeInPercentage] = bipsToPercentage([fee])

  return feeInPercentage
}
