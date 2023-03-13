import Deferred from "helpers/deferred";
import { IArbitrateModalProps, IArbitrateTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { Arbitrate } from "ui/internal/modals";

/**
 * Previously defined/agreed on arbitrator uses this to arbitrate the payment
 *
 * @param escrowId - ID of the escrow to arbitrate
 * @param callbacks - Broadcasted and confirmed callbacks provide to the front-end information about what the arbitrator has submitted and how has the contract processed it
 */
export const arbitrate = async (
  escrowId: number,
  callbacks?: IArbitrateTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const arbitrateModalProps: IArbitrateModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(Arbitrate, arbitrateModalProps);
  return deferredPromise.promise;
};
