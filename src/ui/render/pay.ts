import Deferred from "helpers/deferred";
import {
  IPaymentModalProps,
  IPaymentProps,
  IPayTransactionCallbacks,
} from "typing";
import { renderModal } from "ui/internal/config/render";
import { PayModal } from "ui/internal/modals";

/**
 * Opens a payment modal, which summarizes the escrow parameters for the user (buyer) and displays a button to Pay.
 * If the user is on an incorrect network, it asks them to switch (and provides network configuration automatically).
 *
 * Ultimately it calls ui.pay() function, which  connects user's wallet, checks for the balance in the selected token, asks for approval,
 * and if the address was provided in ENS format, resolves that to ETH address.
 *
 * *NOTE: There's a bug here where if the user opens the modal with one account and 
 * changes a wallet account while the modal is opened, it submits the original user's address as
 * a buyer's address. To be fixed soon
 * 
 * @see {@link core.pay}
 * 
 * @example // The most simple example of 0.1 ETH payment with 2 week challenge period and with no arbitrator or a marketplace
 * await Unicrow.ui.pay({
 *     seller: "0xf463b32cad657fe03921014d99490A0a58290560",
 *     amount: 0.1,
 *     challengePeriod: 86400 * 14,
 *   }, {
 *   confirmed: (payload) {
 *     // print out payload
 *   }
 * })
 *
 * // Console output
 * {
 *    transactionHash: "0xf7d347866aaa583f7a8e63457f4afed85f40932c35ac8ffafc2a1c1dc31b19f6",
 *    blockNumber: 252780689,
 *    paidAt: "2024-09-12T15:07:45.000Z",
 *    escrowId: 2,
 *    arbitrator: null,
 *    arbitratorFee: 0,
 *    buyer: "0x8A62e7F471ad5B5081d4A864580edd944525D1D8",
 *    seller: "0xf463b32cad657fe03921014d99490A0a58290560",
 *    challengePeriod: 1209600,
 *    challengePeriodExtension: 1209600,
 *    challengePeriodStart: "2024-09-12T15:07:45.000Z",
 *    challengePeriodEnd: "2024-09-26T15:07:45.000Z",
 *    marketplace: null,
 *    marketplaceFee: 0,
 *    tokenAddress: null,
 *    paymentReference: "",
 *    claimed: false,
 *    consensusBuyer: 0,
 *    consensusSeller: 1,
 *    splitBuyer: 0,
 *    splitSeller: 100,
 *    splitMarketplace: 0,
 *    splitProtocol: 0.69,
 *    amount: "100000000000000000",
 *    amountBuyer: "0",
 *    amountSeller: "99310000000000000",
 *    amountMarketplace: "0",
 *    amountArbitrator: "0",
 *    amountProtocol: "690000000000000"
 * }
 *
 * // Another example using all the available payment parameters: 
 * //   - tokenAddress to send 100 USDT
 * //   - setting a different buyer 
 * //   - a marketplace and an arbitrator with fees 
 * //   - different challenge period and challenge period extension
 * //   - adding a payment reference
 * await Unicrow.ui.pay({
 *     seller: "0xf463b32cad657fe03921014d99490A0a58290560",
 *     tokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *     amount: 100,
 *     buyer: "0xF257DD5731A679E6642FCd9c53e4e26A1206527e",
 *     arbitrator: "0x59f56CFC88E5660b7D68C4797c6484168eC8E068",
 *     arbitratorFee: 2,
 *     marketplace: "0x696207De45d897d5a353af3c45314a2F852d5B63",
 *     marketplaceFee: 10,
 *     challengePeriod: 86400 * 14,
 *     challengePeriodExtension: 86400 * 7,
 *     paymentReference: "order #1337"
    }, {
 *   confirmed: (payload) {
 *     // print out payload
 *   }
 * })
 *
 * // Output
 * {
 *    transactionHash: "0x51766a44fb247f33e6caf31dbe01579e100dd0b96020c78358b263d86c30c96d",
 *    blockNumber: 252783397,
 *    paidAt: "2024-09-12T15:19:14.000Z",
 *    escrowId: 3,
 *    arbitrator: "0x59f56CFC88E5660b7D68C4797c6484168eC8E068",
 *    arbitratorFee: 2,
 *    buyer: "0xF257DD5731A679E6642FCd9c53e4e26A1206527e",
 *    seller: "0xf463b32cad657fe03921014d99490A0a58290560",
 *    challengePeriod: 1209600,
 *    challengePeriodExtension: 604800,
 *    challengePeriodStart: "2024-09-12T15:19:14.000Z",
 *    challengePeriodEnd: "2024-09-26T15:19:14.000Z",
 *    marketplace: "0x696207De45d897d5a353af3c45314a2F852d5B63",
 *    marketplaceFee: 10,
 *    tokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *    paymentReference: "order #1337",
 *    claimed: false,
 *    consensusBuyer: 0,
 *    consensusSeller: 1,
 *    splitBuyer: 0,
 *    splitSeller: 100,
 *    splitMarketplace: 10,
 *    splitProtocol: 0.69,
 *    amount: "100000000",
 *    amountBuyer: "0",
 *    amountSeller: "87310000",
 *    amountMarketplace: "10000000",
 *    amountArbitrator: "2000000",
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
  const deferredPromise = new Deferred<string>();

  const paymentModalProps: IPaymentModalProps = {
    paymentProps,
    callbacks,
    deferredPromise,
  };

  renderModal(PayModal, paymentModalProps);
  return deferredPromise.promise;
};
