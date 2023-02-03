import Deferred from "helpers/deferred";
import { IRefundModalProps, IRefundTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { RefundModal } from "ui/internal/modals";

/**
 * Refunds 100% of the buyer payment (all fees are waived), returns transactions' hash.
 * Will display an error if called in an incorrect state (e.g. not by the seller)
 *
 * @param escrowId - id of the escrow to refund
 * @throws Error if account is not connected or if called in an invalid state (e.g. already claimed / not called by seller)
 * @returns transaction hash
 */
export const refund = async (
  escrowId: number,
  callbacks?: IRefundTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const refundModalProps: IRefundModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(RefundModal, refundModalProps);
  return deferredPromise.promise;
};
