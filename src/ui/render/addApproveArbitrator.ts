import Deferred from "helpers/deferred";
import {
  IApproveOrProposeArbitrationModalProps,
  IApproveArbitrationTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/internal/config/render";
import { AddApproveArbitrator } from "ui/internal/modals";

/**
 * Opens a modal that checks whether there's an arbitrator proposed or defined for this escrow.
 * If there is no arbitrator proposed or defined, it will display a form for the user to submit their proposed
 * arbitrator's address and fee.
 * If an arbitrator has been proposed, it displays the proposal and allows to either approve it
 *   (if it was the other party who proposed the arbitrator) or to change the proposal (if this user sent the
 *   original proposal)
 *
 * @param escrowId - ID of the escrow
 * @param callbacks - Because the developer doesn't know what the user's proposal is, they can get the information about what user sent from the broadcasted event, and how the contract processed the proposal in the confirmed event
 */
export const addApproveArbitrator = async (
  escrowId: number,
  callbacks?: IApproveArbitrationTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const arbitrateModalProps: IApproveOrProposeArbitrationModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(AddApproveArbitrator, arbitrateModalProps);
  return deferredPromise.promise;
};
