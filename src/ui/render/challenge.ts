import Deferred from "helpers/deferred";
import { IChallengeModalProps, IChallengeTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { ChallengeModal } from "ui/internal/modals";

/**
 * Opens a modal to challenge a payment (either by buyer or seller).
 *
 * @param escrowId - ID of the escrow to challenge
 * @param callbacks - Code to execute at various steps of the challenge. Confirmed in particular provides information about the escrow after the challenge has been processed by the contract
 * @returns Hash of the challenged transaction
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
