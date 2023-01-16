import Deferred from "helpers/deferred";
import {
  IArbitrationModalProps,
  IArbitrationTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/config/render";
import { Arbitrate } from "ui/modals";

/**
 * Renders a modal to propose an arbitration (only visible for arbitrator as agreed by both escrow parties).
 *
 * @returns {Promise<string>}
 */
export const arbitrate = async (
  escrowId: number,
  callbacks?: IArbitrationTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const arbitrateModalProps: IArbitrationModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(Arbitrate, arbitrateModalProps);
  return deferredPromise.promise;
};
