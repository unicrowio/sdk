import Deferred from "helpers/deferred";
import {
  ISettlementOfferModalProps,
  ISettlementOfferTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/internal/config/render";
import { SettlementOfferModal } from "ui/internal/modals";

/**
 * Opens a modal that checks if there is an existing offer to settle the escrow.
 * If not, it will display a form in which the user can submit their settlement offer.
 * If there is an offer, it allows user to accept it (if it was the other party's offer) or to change it (if it was their own)
 *
 * @param escrowId - ID of the escrow
 * @param callbacks - Broadcasted and confirmed callbacks are particularly useful here because they return information about what the user has submitted and how the contract has processed it
 */
export const settlementOffer = async (
  escrowId: number,
  callbacks?: ISettlementOfferTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const settlementModalProps: ISettlementOfferModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(SettlementOfferModal, settlementModalProps);
  return deferredPromise.promise;
};
