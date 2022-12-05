import { UNICROW_CLAIM_ADDRESS } from '../config'
import { UnicrowClaim__factory } from '@unicrow/contract-types'
import { IClaimTransactionCallbacks, SingleClaimParsedPayload } from '../typing'
import { getWeb3Provider } from '../wallet'
import { errorHandler } from './errorHandler'
import { parseSingleClaim } from 'parsers/eventSingleClaim'

/**
 * Claims a single payment from the escrow. To save everyone's gas costs, it claims balances and fees
 * of all parties that are eligible for a share from the escrow.
 *
 * @async
 * @param number escrowId
 * @typeParam IClaimTransactionCallbacks callbacks (optional, interface)
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<SingleClaimParsedPayload>}
 */
export const singleClaim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks
): Promise<SingleClaimParsedPayload> => {
  callbacks?.connectingWallet && callbacks.connectingWallet()
  const provider = await getWeb3Provider()

  if (!provider) {
    throw new Error('Error on Claiming, Account Not connected')
  }

  callbacks?.connected && callbacks.connected()

  const smartContract = UnicrowClaim__factory.connect(
    UNICROW_CLAIM_ADDRESS,
    provider.getSigner()
  )

  try {
    const singleClaimTx = await smartContract.singleClaim(escrowId)
    callbacks?.broadcasting && callbacks.broadcasting()

    callbacks?.broadcasted &&
      callbacks.broadcasted({
        transactionHash: singleClaimTx.hash
      })

    const receiptTx = await singleClaimTx.wait()

    const parsedPayload = parseSingleClaim(receiptTx.events)

    callbacks?.confirmed && callbacks.confirmed(parsedPayload)

    return parsedPayload
  } catch (error) {
    const errorMessage = errorHandler(error)
    throw new Error(errorMessage)
  }
}
