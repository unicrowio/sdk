import Deferred from "helpers/deferred";
import { IReleaseModalProps, IReleaseTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { ReleaseModal } from "ui/internal/modals";

/**
 * Release the escrow to the seller and to all other parties that charge a fee from it.
 * Displays an error if called in an incorrect state (e.g. called by someone else than the buyer, or already claimed)
 *
 * @param escrowId - if of the escrow to release
 * @throws If account is not connected or if called in invalid state (e.g. already claimed / not called by the buyer)
 * @returns transaction hash
 */
export const release = async (
  escrowId: number,
  callbacks?: IReleaseTransactionCallbacks,
): Promise<string> => {
  const deferredPromise = new Deferred<string>();

  const releaseModalProps: IReleaseModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(ReleaseModal, releaseModalProps);
  return deferredPromise.promise;
};
