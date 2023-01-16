import Deferred from "helpers/deferred";
import { IClaimModalProps, IClaimTransactionCallbacks } from "typing";
import { renderModal } from "ui/config/render";
import { ClaimModal } from "ui/modals";

/**
 * Renders a modal to claim a given amount to current user from the payment. //TODO clarify
 *
 * @returns {Promise<string>}
 */
export const claim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const claimModalProps: IClaimModalProps = {
    escrowId,
    callbacks,
    deferredPromise,
  };

  renderModal(ClaimModal, claimModalProps);
  return deferredPromise.promise;
};
