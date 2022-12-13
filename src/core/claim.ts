import { UNICROW_CLAIM_ADDRESS } from '../config'
import { UnicrowClaim__factory } from '@unicrow/contract-types'
import { IClaimTransactionCallbacks, ClaimParsedPayload } from '../typing'
import { getWeb3Provider, autoSwitchNetwork } from '../wallet'
import { errorHandler } from './errorHandler'
import { parseClaim } from 'parsers/eventClaim'

/**
 * Claims a single payment from the escrow. To save everyone's gas costs, it claims balances and fees
 * of all parties that are eligible for a share from the escrow.
 *
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ClaimParsedPayload>}
 */
export const claim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks
): Promise<ClaimParsedPayload> => {
  callbacks?.connectingWallet && callbacks.connectingWallet()
  const provider = await getWeb3Provider()

  if (!provider) {
    throw new Error('Error on Claiming, Account Not connected')
  }

  autoSwitchNetwork(callbacks)

  callbacks?.connected && callbacks.connected()

  const smartContract = UnicrowClaim__factory.connect(
    UNICROW_CLAIM_ADDRESS,
    provider.getSigner()
  )

  try {
    const claimTx = await smartContract.claim(escrowId)
    callbacks?.broadcasting && callbacks.broadcasting()

    callbacks?.broadcasted &&
      callbacks.broadcasted({
        transactionHash: claimTx.hash
      })

    const receiptTx = await claimTx.wait()

    const parsedPayload = parseClaim(receiptTx.events)

    callbacks?.confirmed && callbacks.confirmed(parsedPayload)

    return parsedPayload
  } catch (error) {
    const errorMessage = errorHandler(error)
    throw new Error(errorMessage)
  }
}
