import Deferred from "helpers/deferred";
import { IClaimModalProps, IClaimTransactionCallbacks } from "typing";
import { renderModal } from "ui/internal/config/render";
import { ClaimModal } from "ui/internal/modals";
import { getNetwork } from "../../wallet";

/**
 * Displays how much the connected user has in the selected escrow and allows them to claim the escrow.
 * To save everyone's gas costs, it claims balances and fees for all parties that are eligible for it.
 *
 * @param escrowId - ID of the escrow to claim
 * @param callbacks - Code to execute at various stages of the claim transaction. Confirmed callback provides information about the claimed amounts
 * @returns Transaction hash
 */
export const claim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const chainId = (await getNetwork())?.chainId;

  const claimModalProps: IClaimModalProps = {
    chainId,
    escrowId,
    callbacks,
    deferredPromise,
  };

  renderModal(ClaimModal, claimModalProps);
  return deferredPromise.promise;
};
