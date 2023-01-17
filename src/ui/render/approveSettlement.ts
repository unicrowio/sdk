import Deferred from "helpers/deferred";
import {
  ISettlementApproveModalProps,
  ISettlementApproveTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/internal/config/render";
import { ApproveSettlementModal } from "ui/internal/modals";

/**
 * Renders a modal to approve a settlement proposal (either by buyer or seller).
 *
 * @returns {Promise<string>}
 */
export const approveSettlement = async (
  escrowId: number,
  callbacks?: ISettlementApproveTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const settlementModalProps: ISettlementApproveModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(ApproveSettlementModal, settlementModalProps);
  return deferredPromise.promise;
};
