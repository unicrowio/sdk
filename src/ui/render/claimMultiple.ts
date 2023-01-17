import Deferred from "helpers/deferred";
import {
  GetResponseUserBalance,
  IClaimMultipleModalProps,
  IClaimTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/internal/config/render";
import { ClaimMultipleModal } from "ui/internal/modals";

/**
 * Renders a modal to claim a given amount to different wallets (?) from the payment. //TODO clarify
 *
 * @returns {Promise<string>}
 */
export const claimMultiple = async (
  escrowIds: number[],
  balances: GetResponseUserBalance,
  callbacks?: IClaimTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const claimMultipleModalProps: IClaimMultipleModalProps = {
    escrowIds,
    balances,
    callbacks,
    deferredPromise,
  };

  renderModal(ClaimMultipleModal, claimMultipleModalProps);
  return deferredPromise.promise;
};
