import Deferred from "helpers/deferred";
import { IChallengeModalProps, IChallengeTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { ChallengeModal } from "ui/internal/modals";

/**
 * Renders a modal to challenge a payment (either by buyer or seller).
 *
 * @returns {Promise<string>}
 */
export const challenge = async (
  escrowId: number,
  callbacks?: IChallengeTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const challengeModalProps: IChallengeModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(ChallengeModal, challengeModalProps);
  return deferredPromise.promise;
};
