import { tag } from "../helpers/tag";
import { jss } from "../ui/jss";
import {
  GetResponseUserBalance,
  IClaimMultipleModalProps,
  IPaymentModalProps,
  IPaymentProps,
  IReleaseModalProps,
  IPayTransactionCallbacks,
  IReleaseTransactionCallbacks,
  IClaimTransactionCallbacks,
  IRefundTransactionCallbacks,
  IChallengeTransactionCallbacks,
  IChallengeModalProps,
  IArbitrationModalProps,
  IArbitrationTransactionCallbacks,
  IClaimModalProps,
  IRefundModalProps,
  ISettlementApproveTransactionCallbacks,
  ISettlementOfferTransactionCallbacks,
  ISettlementOfferModalProps,
  ISettlementApproveModalProps,
} from "../typing";
import ReactDOM from "react-dom";
import React, { FunctionComponent } from "react";
import { ROOT_UNICROW_SDK_ELEMENT } from "../helpers/constants";
import Deferred from "../helpers/deferred";
import {
  RefundModal,
  ClaimModal,
  PayModal,
  ReleaseModal,
  ClaimMultipleModal,
  ChallengeModal,
  Arbitrate,
  AddApproveArbitrator,
  ApproveSettlementModal,
  SettlementOfferModal,
} from "./modals";
import { validateParameters } from "../helpers/validateParameters";
import { toast } from "./components/notification/toast";

// load Google font Inter
if (typeof window !== "undefined") {
  const font1 = tag("link");
  font1.rel = "preconnect";
  font1.href = "https://fonts.googleapis.com";

  const font2 = tag("link");
  font2.rel = "preconnect";
  font2.href = "https://fonts.gstatic.com";
  font2.crossOrigin = "anonymous";

  const font3 = tag("link");
  font3.rel = "stylesheet";
  font3.href =
    "https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap";

  document.head.append(font1, font2, font3);
}

jss
  .createStyleSheet({
    "@global html, body": {
      fontFamily: `'Bai Jamjuree', 'Work Sans', sans-serif`,
      fontWeight: "400",
      margin: 0,
      boxSizing: "border-box",
      MozOsxFontSmoothing: "grayscale",
      WebkitFontSmoothing: "antialiased",
    },
  })
  .attach();

const CreateReactElement = React.createElement;

/**
 * Creates a modal within .rootUnicrowSDkElement (use props you want to pass to React.createElement for your component).
 *
 */
export const renderModal = (component: FunctionComponent<any>, props?: any) => {
  let container = document.getElementById(ROOT_UNICROW_SDK_ELEMENT);

  if (!container) {
    const rootUnicrowSDkElement = document.createElement("div");
    rootUnicrowSDkElement.id = ROOT_UNICROW_SDK_ELEMENT;
    document.documentElement.append(rootUnicrowSDkElement);
  }

  container = document.getElementById(ROOT_UNICROW_SDK_ELEMENT);

  ReactDOM.render(CreateReactElement(component, props), container);
};

/**
 * Destroys modal if any present.
 *
 */
export const umountModal = () => {
  const root = document.getElementById(ROOT_UNICROW_SDK_ELEMENT);
  if (root) {
    ReactDOM.unmountComponentAtNode(root);
  }
};

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

  console.log({ callbacks })

  const paymentModalProps: IPaymentModalProps = {
    paymentProps: paymentProps,
    callbacks,
    deferredPromise,
  };

  renderModal(PayModal, paymentModalProps);
  return deferredPromise.promise;
};

/**
 * Renders a modal to release the payment.
 *
 * @returns {Promise<string>}
 */
export const release = async (
  escrowId: number,
  callbacks?: IReleaseTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const releaseModalProps: IReleaseModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(ReleaseModal, releaseModalProps);
  return deferredPromise.promise;
};

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

/**
 * Renders a modal to claim a given amount to current user from the payment. //TODO clarify
 *
 * @returns {Promise<string>}
 */
export const claim = async (
  escrowId: number,
  callbacks?: IClaimTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const claimModalProps: IClaimModalProps = {
    escrowId,
    callbacks,
    deferredPromise,
  };

  renderModal(ClaimModal, claimModalProps);
  return deferredPromise.promise;
};

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

/**
 * Renders a modal to challenge a payment (either by buyer or seller).
 *
 * @returns {Promise<string>}
 */
export const challenge = async (
  escrowId: number,
  callbacks?: IChallengeTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const challengeModalProps: IChallengeModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(ChallengeModal, challengeModalProps);
  return deferredPromise.promise;
};

/**
 * Renders a modal to offer a settlement proposal (either by buyer or seller).
 *
 * @returns {Promise<string>}
 */
export const settlementOffer = async (
  escrowId: number,
  callbacks?: ISettlementOfferTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const settlementModalProps: ISettlementOfferModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(SettlementOfferModal, settlementModalProps);
  return deferredPromise.promise;
};

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

/**
 * Renders a modal to propose an arbitrator for a payment (either by buyer or seller).
 *
 * @returns {Promise<string>}
 */
export const addApproveArbitrator = async (
  escrowId: number,
  callbacks?: IArbitrationTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const arbitrateModalProps: IArbitrationModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(AddApproveArbitrator, arbitrateModalProps);
  return deferredPromise.promise;
};

/**
 * Renders a modal to propose an arbitration (only visible for arbitrator as agreed by both escrow parties).
 *
 * @returns {Promise<string>}
 */
export const arbitrate = async (
  escrowId: number,
  callbacks?: IArbitrationTransactionCallbacks,
) => {
  const deferredPromise = new Deferred<string>();

  const arbitrateModalProps: IArbitrationModalProps = {
    escrowId,
    deferredPromise,
    callbacks,
  };

  renderModal(Arbitrate, arbitrateModalProps);
  return deferredPromise.promise;
};
