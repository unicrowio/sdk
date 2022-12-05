import { UNICROW_ADDRESS } from '../config'
import { Unicrow__factory } from '@unicrow/contract-types'
import { IRefundTransactionCallbacks } from '../typing'
import { getWeb3Provider } from '../wallet'
import { errorHandler } from './errorHandler'

/**
 * Refunds 100% of the buyer payment (all fees are waived), returns transactions' hash.
 *
 * @privateRemarks Can only be called by the seller.
 * @async
 * @param number escrowId
 * @typeParam IRefundTransactionCallbacks callbacks (optional, interface)
 * @throws Error
 * If account is not connected (=no provider given) or if called in invalid state (e.g. already claimed / not called by seller)
 * @returns {Promise<string>}
 */
export const refund = async (
  escrowId: number,
  callbacks?: IRefundTransactionCallbacks
) => {
  callbacks?.connectingWallet && callbacks.connectingWallet()
  const provider = await getWeb3Provider()

  if (!provider) {
    throw new Error('Error on Refund, Account Not connected')
  }

  callbacks?.connected && callbacks.connected()

  const smartContract = Unicrow__factory.connect(
    UNICROW_ADDRESS,
    provider.getSigner()
  )

  try {
    const refundTx = await smartContract.refund(escrowId)
    callbacks?.broadcasting && callbacks.broadcasting()
    callbacks?.broadcasted &&
      callbacks.broadcasted({
        transactionHash: refundTx.hash
      })

    await refundTx.wait()

    callbacks?.confirmed &&
      callbacks.confirmed({
        transactionHash: refundTx.hash
      })

    return refundTx.hash
  } catch (error) {
    const errorMessage = errorHandler(error)
    throw new Error(errorMessage)
  }
}
