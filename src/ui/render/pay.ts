import { validateParameters } from "helpers";
import Deferred from "helpers/deferred";
import {
  IPaymentModalProps,
  IPaymentProps,
  IPayTransactionCallbacks,
} from "typing";
import { toast } from "ui/internal/notification/toast";
import { renderModal } from "ui/internal/config/render";
import { PayModal } from "ui/internal/modals";

/**
 * Renders payment modal with given payment params.
 *
 * @example
 * ```js
 *  const response = await crow.ui.pay({});
 *  console.log(response)
 * ```
 *
 * @throws Error
 * If payment parameters are not valid.
 * @returns {Promise<string>}
 */
export const pay = async (
  paymentProps: IPaymentProps,
  callbacks?: IPayTransactionCallbacks,
) => {
  const data = paymentProps;

  try {
    const addrs = await validateParameters(data);

    Object.entries(addrs.common).forEach(([key, value]) => {
      paymentProps[key] = value;
    });

    paymentProps.ensAddresses = addrs.ens;
  } catch (error: any) {
    toast(error, "error");
    return;
  }

  const deferredPromise = new Deferred<string>();

  const paymentModalProps: IPaymentModalProps = {
    paymentProps: paymentProps,
    callbacks,
    deferredPromise,
  };

  renderModal(PayModal, paymentModalProps);
  return deferredPromise.promise;
};
