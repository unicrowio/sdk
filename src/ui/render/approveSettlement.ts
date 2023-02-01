import Deferred from "helpers/deferred";
import {
  ISettlementApproveModalProps,
  ISettlementApproveTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/internal/config/render";
import { ApproveSettlementModal } from "ui/internal/modals";

/**
 * @deprecated redundant function, will be removed (use settlementOffer() instead)
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
