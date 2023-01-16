import Deferred from "helpers/deferred";
import {
  IArbitrationModalProps,
  IArbitrationTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/config/render";
import { AddApproveArbitrator } from "ui/modals";

/**
 * Renders a modal to propose an arbitrator for a payment (either by buyer or seller).
 *
 * @returns {Promise<string>}
 */
export const addApproveArbitrator = async (
  escrowId: number,
  callbacks?: IArbitrationTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const arbitrateModalProps: IArbitrationModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(AddApproveArbitrator, arbitrateModalProps);
  return deferredPromise.promise;
};
