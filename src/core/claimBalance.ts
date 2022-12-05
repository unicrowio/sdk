import { UNICROW_CLAIM_ADDRESS } from '../config'
import { UnicrowClaim__factory } from '@unicrow/contract-types'
import { ClaimParsedPayload, IClaimTransactionCallbacks } from '../typing'
import { getWeb3Provider } from '../wallet'
import { errorHandler } from './errorHandler'
import { parseClaim } from 'parsers/eventClaim'

/**
 * Claim multiple escrow payments at the same time. To save everyone's gas costs, it claims balances and fees
 * of all parties that are eligible for a share from the escrow. The contract will check if each of the provided
 * escrows are indeed claimable and if not, will revert the transaction and return an error.
 * {@link indexer.getClaimableEscrow()} provides an easy way to get a predigested list for this function.
 * The gas cost of this grows almost linearly with each additional escrow, therefore this function will set an
 * appropriate gas limit if necessary.
 *
 * @async
 * @param string[] wallets
 * @typeParam IClaimTransactionCallbacks callbacks (optional, interface)
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns `Promise<ClaimParsedPayload>`
 */
export const claim = async (
  wallets: string[],
  callbacks?: IClaimTransactionCallbacks
): Promise<ClaimParsedPayload> => {
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
    // FIX-ME: No need to get signer if the contract reference is initialized globally
    const claimTx = await smartContract.claim(wallets)
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
