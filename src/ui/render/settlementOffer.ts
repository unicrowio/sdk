import Deferred from "helpers/deferred";
import {
  ISettlementOfferModalProps,
  ISettlementOfferTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/config/render";
import { SettlementOfferModal } from "ui/modals";

/**
 * Renders a modal to offer a settlement proposal (either by buyer or seller).
 *
 * @returns {Promise<string>}
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
