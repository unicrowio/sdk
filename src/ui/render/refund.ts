import Deferred from "helpers/deferred";
import { IRefundModalProps, IRefundTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { RefundModal } from "ui/internal/modals";

/**
 * Renders a modal to release the payment (can only be done by seller).
 *
 * @returns {Promise<string>}
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
