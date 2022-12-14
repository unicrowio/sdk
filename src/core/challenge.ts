import { UnicrowDispute__factory } from '@unicrowio/ethers-types'

import { autoSwitchNetwork, getWeb3Provider } from '../wallet'
import { getContractAddress } from '../config'
import {
  ChallengeParsedPayload,
  IChallengeTransactionCallbacks
} from '../typing'
import { errorHandler } from './errorHandler'
import { parseChallenge } from 'parsers/eventChallenge'

/**
 * Performs a challenge and returns its data.
 *
 * @async
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ChallengeParsedPayload>}
 */
export const challenge = async (
  escrowId: number,
  callbacks?: IChallengeTransactionCallbacks
): Promise<ChallengeParsedPayload> => {
  callbacks?.connectingWallet && callbacks.connectingWallet()
  const provider = await getWeb3Provider()

  if (!provider) {
    throw new Error('Error on Challenge, Account Not connected')
  }

  autoSwitchNetwork(callbacks)

  try {
    callbacks?.connected && callbacks.connected()
    const smartContract = UnicrowDispute__factory.connect(
      getContractAddress('dispute'),
      provider.getSigner()
    )

    callbacks?.broadcasting && callbacks.broadcasting()
    const challengeTx = await smartContract.challenge(escrowId)

    callbacks?.broadcasted &&
      callbacks.broadcasted({
        transactionHash: challengeTx.hash
      })

    const receiptTx = await challengeTx.wait()

    const parsedPayload = parseChallenge(receiptTx)

    callbacks?.confirmed && callbacks.confirmed(parsedPayload)

    return parsedPayload
  } catch (error) {
    const errorMessage = errorHandler(error)
    throw new Error(errorMessage)
  }
}
