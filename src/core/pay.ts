import { ERC20__factory, Unicrow__factory } from "@unicrowio/ethers-types";
import {
  ADDRESS_ZERO,
  ZERO_FEE_VALUE,
  ETH_ADDRESS,
  validateParameters,
  parseAmount,
} from "../helpers";
import { getContractAddress } from "../config";
import {
  IPaymentProps,
  IPayTransactionCallbacks,
  PayParsedPayload,
} from "../typing";
import { getBalance } from "./getBalance";
import { getTokenInfo } from "../core/getTokenInfo";
import { errorHandler } from "./internal/errorHandler";
import {
  getWeb3Provider,
  getCurrentWalletAddress,
  autoSwitchNetwork,
} from "../wallet";
import { EscrowInputStruct } from "@unicrowio/ethers-types/src/contracts/Unicrow";
import { parsePay } from "./internal/parsers/eventPay";

/**
 * Deposits a payment into an escrow and returns its data.
 * The function automagically connects user's wallet, checks for the balance in the selected token, asks for approval,
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
 * // Console output
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
 * @returns Details of the payment as returned by the contract's Pay event
 */
export const pay = async (
  paymentProps: IPaymentProps,
  callbacks?: IPayTransactionCallbacks,
): Promise<PayParsedPayload> => {
  const {
    amount,
    tokenAddress = ETH_ADDRESS,
    seller,
    challengePeriod,
    marketplace,
    marketplaceFee = ZERO_FEE_VALUE,
    arbitrator,
    arbitratorFee = ZERO_FEE_VALUE,
    challengePeriodExtension = 0,
  } = paymentProps;

  callbacks && callbacks.connectingWallet && callbacks.connectingWallet();

  const provider = await getWeb3Provider();
  if (!provider) {
    throw new Error("Wallet not connected");
  }

  await autoSwitchNetwork(callbacks);

  const walletAddress = await getCurrentWalletAddress();
  callbacks && callbacks.connected && callbacks.connected(walletAddress);

  const providerSigner = await provider.getSigner();

  const marketplaceFeeValue = 100 * marketplaceFee;
  const arbitratorFeeValue = 100 * arbitratorFee;
  const marketplaceAddress = marketplace || ADDRESS_ZERO;
  const { addresses, token } = await validateParameters({
    seller,
    arbitrator,
    arbitratorFee: paymentProps.arbitratorFee,
    marketplace: marketplaceAddress,
    marketplaceFee: marketplaceFeeValue,
    challengePeriod: paymentProps.challengePeriod,
    challengePeriodExtension: paymentProps.challengePeriodExtension,
    tokenAddress,
    amount,
    buyer: walletAddress,
  });
  const _arbitrator = addresses.common.arbitrator || ADDRESS_ZERO;

  let solidityAmount = parseAmount(amount.toString(), token.decimals);
  const balance = await getBalance(tokenAddress);
  if (balance < solidityAmount) {
    throw new Error(`Insufficient balance: ${balance} < ${solidityAmount}`);
  }

  const unicrowAddress = getContractAddress("unicrow");

  if (tokenAddress != ETH_ADDRESS) {
    const token = ERC20__factory.connect(tokenAddress, providerSigner);

    const alreadyAllowedAmount = await token.allowance(
      walletAddress,
      unicrowAddress,
    );

    // Checking with equals because previous allowance value was not related to this new transaction.
    // TODO: Maybe we should approve an infinity amount to contract in order to prevent this transaction request
    if (alreadyAllowedAmount < solidityAmount) {
      // Allowing as close as we can to infinity
      const approveTx = await token.approve(unicrowAddress, solidityAmount);
      // This transaction supposed to be mined very fast
      await approveTx.wait();
    }
  }

  const payInput: EscrowInputStruct = {
    seller: addresses.common.seller,
    marketplace: addresses.common.marketplace,
    marketplaceFee: marketplaceFeeValue,
    currency: tokenAddress,
    challengePeriod,
    challengeExtension: challengePeriodExtension,
    amount: solidityAmount,
  };

  try {
    callbacks && callbacks.broadcasting && callbacks.broadcasting();

    const unicrowSc = Unicrow__factory.connect(unicrowAddress, providerSigner);

    let payTx: any;
    // { value: solidityAmount } should be passed only in case of Ethers
    if (tokenAddress === ETH_ADDRESS) {
      payTx = await unicrowSc.pay(payInput, _arbitrator, arbitratorFeeValue, {
        value: solidityAmount,
      });
    } else {
      payTx = await unicrowSc.pay(payInput, _arbitrator, arbitratorFeeValue);
    }

    callbacks &&
      callbacks.broadcasted &&
      callbacks.broadcasted({
        transactionHash: payTx.hash,
        buyer: walletAddress,
      });

    const receiptTx = await payTx.wait();

    const parsedPayload = parsePay(receiptTx.logs);

    callbacks && callbacks.confirmed && callbacks.confirmed(parsedPayload);

    return parsedPayload;
  } catch (error) {
    const errorMessage = errorHandler(error);
    throw new Error(errorMessage);
  }
};
