import { UnicrowDispute__factory } from '@unicrow/contract-types'

import { UNICROW_DISPUTE_ADDRESS } from '../config'
import {
  ISettlementOfferTransactionCallbacks,
  OfferSettlementParsedPayload
} from '../typing'
import { errorHandler } from './errorHandler'
import { getWeb3Provider } from '../wallet'
import { parseOfferSettlement } from 'parsers/eventOfferSettlement'

/**
 * Sends an offer to settle the payment arbitrarily between the buyer and the seller. The other party must confirm
 * the settlement in order for it to be executed.
 *
 * @async
 * @param number escrowId
 * @param number splitBuyer
 * @param number splitSeller
 * @typeParam ISettlementOfferTransactionCallbacks callbacks (optional, interface)
 * @throws Error
 * If account is not connected (=no provider given) or if sth. else went wrong.
 * @returns {Promise<OfferSettlementParsedPayload>}
 */
export const offerSettlement = async (
  escrowId: number,
  splitBuyer: number,
  splitSeller: number,
  callbacks?: ISettlementOfferTransactionCallbacks
): Promise<OfferSettlementParsedPayload> => {
  try {
    callbacks?.connectingWallet && callbacks.connectingWallet()
    const provider = await getWeb3Provider()

    if (!provider) {
      throw new Error('Error on Settlement, Account Not connected')
    }

    const crowDisputeContract = UnicrowDispute__factory.connect(
      UNICROW_DISPUTE_ADDRESS,
      provider.getSigner()
    )

    callbacks?.broadcasting && callbacks.broadcasting()
    const settlementTx = await crowDisputeContract.offerSettlement(escrowId, [
      splitBuyer * 100,
      splitSeller * 100
    ])

    callbacks?.broadcasted &&
      callbacks.broadcasted({
        transactionHash: settlementTx.hash,
        splitBuyer,
        splitSeller
      })

    const receiptTx = await settlementTx.wait()

    const parsedPayload = parseOfferSettlement(receiptTx.events)

    callbacks?.confirmed && callbacks.confirmed(parsedPayload)

    return parsedPayload
  } catch (error) {
    const errorMessage = errorHandler(error)
    throw new Error(errorMessage)
  }
}
