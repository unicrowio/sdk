import Deferred from "helpers/deferred";
import { IReleaseModalProps, IReleaseTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { ReleaseModal } from "ui/internal/modals";

/**
 * Renders a modal to release the payment.
 *
 * @returns {Promise<string>}
 */
export const release = async (
  escrowId: number,
  callbacks?: IReleaseTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const releaseModalProps: IReleaseModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(ReleaseModal, releaseModalProps);
  return deferredPromise.promise;
};
