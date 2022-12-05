import { UnicrowArbitrator__factory } from '@unicrow/contract-types'
import { UNICROW_ARBITRATOR_ADDRESS } from '../config'
import {
  IArbitrationTransactionCallbacks,
  ProposalArbitratorParsedPayload
} from '../typing'
import { errorHandler } from './errorHandler'
import { getWeb3Provider } from '../wallet'
import { validateAddress } from '../helpers/validateAddress'
import { parseProposalArbitrator } from 'parsers/eventProposalArbitrator'

/**
 * One of the parties (buyer or seller) can call this to propose an arbitrator
 * for an escrow that has no arbitrator defined.
 *
 * @async
 * @param number escrowId
 * @param string arbitrator
 * @param number arbitratorFee
 * @typeParam IArbitrationTransactionCallbacks callbacks (optional, interface)
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<ProposalArbitratorParsedPayload>}
 */
export const proposeArbitrator = async (
  escrowId: number,
  arbitrator: string,
  arbitratorFee: number,
  callbacks?: IArbitrationTransactionCallbacks
): Promise<ProposalArbitratorParsedPayload> => {
  try {
    validateAddress({ arbitrator })

    callbacks?.connectingWallet && callbacks.connectingWallet()
    const provider = await getWeb3Provider()

    if (!provider) {
      throw new Error('Error on Adding Arbitrator. Account not connected')
    }

    const crowArbitratorContract = UnicrowArbitrator__factory.connect(
      UNICROW_ARBITRATOR_ADDRESS,
      provider.getSigner()
    )

    callbacks?.broadcasting && callbacks.broadcasting()
    const proposeArbitratorTx = await crowArbitratorContract.proposeArbitrator(
      escrowId,
      arbitrator,
      arbitratorFee * 100
    )

    callbacks?.broadcasted &&
      callbacks.broadcasted({
        transactionHash: proposeArbitratorTx.hash,
        arbitrator,
        arbitratorFee
      })

    const receiptTx = await proposeArbitratorTx.wait()

    const parsedPayload = parseProposalArbitrator(receiptTx.events)

    callbacks?.confirmed && callbacks.confirmed(parsedPayload)

    return parsedPayload
  } catch (error) {
    const errorMessage = errorHandler(error)
    throw new Error(errorMessage)
  }
}
