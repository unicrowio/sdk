import { validateParameters } from "helpers";
import Deferred from "helpers/deferred";
import {
  IPaymentModalProps,
  IPaymentProps,
  IPaymentPropsData,
  IPayTransactionCallbacks,
} from "typing";
import { toast } from "ui/internal/notification/toast";
import { renderModal } from "ui/internal/config/render";
import { PayModal } from "ui/internal/modals";
import { getWalletAccount } from "wallet";

/**
 * Opens a payment modal, which summarizes the escrow parameters for the user (buyer) and displays a button to Pay.
 * If the user is on an incorrect network, it asks them to switch (and provides network configuration automatically).
 *
 * Ultimately it calls ui.pay() function, which  connects user's wallet, checks for the balance in the selected token, asks for approval,
 * and if the address was provided in ENS format, resolves that to ETH address.
 *
 * @example // The most simple example of 1 ETH payment with 2 week challenge period and with no arbitrator or a marketplace
 * await unicrowSdk.ui.pay({
 *   seller: "0xA98135151f8dCd5632A63CC6358f5684c62B041D",
 *   amount: 1,
 *   challengePeriod: ONE_DAY_IN_SEC * 14
 * }, {
 *   confirmed: (payload) {
 *     // print out payload
 *   }
 * })
 *
 * // Output
 * {
 *    name: "Pay",
 *    transactionHash: "0x965b682d76617355e701ad5e3ece8760f8b0e76815d7d817ee84a8cbdb1f4cd7",
 *    blockNumber: 7956,
 *    paidAt: "2023-01-27T16:31:07.000Z",
 *    escrowId: 593,
 *    arbitrator: null,
 *    arbitratorFee: 0,
 *    buyer: "0xD0244c3B17792390010581D54951ba049dF85861",
 *    seller: "0xA98135151f8dCd5632A63CC6358f5684c62B041D",
 *    challengePeriod: 1209600,
 *    challengePeriodExtension: 1209600,
 *    challengePeriodStart: "2023-01-27T16:31:07.000Z",
 *    challengePeriodEnd: "2023-02-10T16:31:07.000Z",
 *    marketplace: null,
 *    marketplaceFee: 0,
 *    tokenAddress: null,
 *    claimed: false,
 *    consensusBuyer: 0,
 *    consensusSeller: 1,
 *    splitBuyer: 0,
 *    splitSeller: 100,
 *    splitMarketplace: 0,
 *    splitProtocol: 0.69,
 *    amount: "1000000000000000000",
 *    amountBuyer: "0",
 *    amountSeller: "993100000000000000",
 *    amountMarketplace: "0",
 *    amountArbitrator: "0",
 *    amountProtocol: "6900000000000000"
 * }
 *
 * // Another example of 1,000 USDT payment with a marketplace and an arbitrator and a different challenge period and extension
 * await unicrowSdk.ui.pay({
 *   seller: "0xA98135151f8dCd5632A63CC6358f5684c62B041D",
 *   tokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *   amount: 1000,
 *   challengePeriod: ONE_DAY_IN_SEC * 14,
 *   challengePeriod: ONE_DAY_IN_SEC * 7,
 *   marketplace: "0xf8C03F09b4f53FDc05b57c7846da5F428798f187",
 *   marketplaceFee: 5,
 *   arbitrator: "0x3C86F543e64810E1d843809B2b70a4FDcC3b9B66",
 *   arbitratorFee: 2
 * }, {
 *   confirmed: (payload) {
 *     // print out payload
 *   }
 * })
 *
 * // Output
 * {
 *    name: "Pay",
 *    transactionHash: "0xb37166392207bbd7e89858606e3b88d11d9d00fb1f508bc0e81dc8a3a990c69f",
 *    blockNumber: 7958,
 *    paidAt: "2023-01-27T16:32:33.000Z",
 *    escrowId: 594,
 *    arbitrator: "0x3C86F543e64810E1d843809B2b70a4FDcC3b9B66",
 *    arbitratorFee: 2,
 *    buyer: "0xD0244c3B17792390010581D54951ba049dF85861",
 *    seller: "0xA98135151f8dCd5632A63CC6358f5684c62B041D",
 *    challengePeriod: 1209600,
 *    challengePeriodExtension: 604800,
 *    challengePeriodStart: "2023-01-27T16:32:33.000Z",
 *    challengePeriodEnd: "2023-02-10T16:32:33.000Z",
 *    marketplace: "0xf8C03F09b4f53FDc05b57c7846da5F428798f187",
 *    marketplaceFee: 5,
 *    tokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *    claimed: false,
 *    consensusBuyer: 0,
 *    consensusSeller: 1,
 *    splitBuyer: 0,
 *    splitSeller: 100,
 *    splitMarketplace: 5,
 *    splitProtocol: 0.69,
 *    amount: "1000000000",
 *    amountBuyer: "0",
 *    amountSeller: "923100000",
 *    amountMarketplace: "50000000",
 *    amountArbitrator: "20000000",
 *    amountProtocol: "690000"
 * }
 * @param paymentProps - Payment details
 * @param callbacks - Pass code to any of these to be executed when the respective step takes place in the wallet
 * @throws Error if the user doesn't connect wallet, doesn't approve token spending, doesn't have a a sufficient amount, or if any of the parameters has incorrect format
 * @returns Hash of the payment transaction
 */
export const pay = async (
  paymentProps: IPaymentProps,
  callbacks?: IPayTransactionCallbacks,
) => {
  const data: IPaymentPropsData = paymentProps;

  try {
    const userWallet = await getWalletAccount();
    const addrs = await validateParameters({...data, buyer: userWallet});

    Object.entries(addrs.common).forEach(([key, value]) => {
      paymentProps[key] = value;
    });

    data.ensAddresses = addrs.ens;
  } catch (error: any) {
    toast(error, "error");
    return;
  }

  const deferredPromise = new Deferred<string>();

  const paymentModalProps: IPaymentModalProps = {
    paymentProps: data,
    callbacks,
    deferredPromise,
  };

  renderModal(PayModal, paymentModalProps);
  return deferredPromise.promise;
};
