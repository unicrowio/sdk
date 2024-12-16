import Deferred from "helpers/deferred";
import {
  GetResponseUserBalance,
  IClaimMultipleModalProps,
  IClaimTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/internal/config/render";
import { ClaimMultipleModal } from "ui/internal/modals";
import { getNetwork } from "../../wallet";

/**
 * Displays a modal that summarizes user's balance in all the provided escrows. The balances have to
 * be provided as a separate parameter. Indexer provides an easy way to get inputs for this function
 *
 * @param escrowIds - List of escrow IDs to be claimed. You can get this from indexer's getClaimableEscrows() function
 * @param balances - Balance broken down by token. You can get this from indexer's getUserBalance() function
 * @param callbacks - Code to execute at various stages of the claim transaction. Confirmed provides information about withdrawn balances (in tokens)
 * @returns Claim Transaction hash
 */
export const claimMultiple = async (
  escrowIds: number[],
  balances: GetResponseUserBalance,
  callbacks?: IClaimTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const chainId = (await getNetwork())?.chainId;

  const claimMultipleModalProps: IClaimMultipleModalProps = {
    chainId,
    escrowIds,
    balances,
    callbacks,
    deferredPromise,
  };

  renderModal(ClaimMultipleModal, claimMultipleModalProps);
  return deferredPromise.promise;
};
