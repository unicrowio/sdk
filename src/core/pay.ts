import { ethers } from "ethers";
import { ERC20__factory, Unicrow__factory } from "@unicrowio/ethers-types";
import { ZERO_FEE_VALUE, validateParameters, parseAmount } from "../helpers";
import { getContractAddress } from "../config";
import {
  IPaymentProps,
  IPayTransactionCallbacks,
  PayParsedPayload,
} from "../typing";
import { getBalance } from "./getBalance";
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
 * @example // The most simple example of 0.1 ETH payment with 2 week challenge period and with no arbitrator or a marketplace
 * await Unicrow.core.pay({
 *     seller: "0xf463b32cad657fe03921014d99490A0a58290560",
 *     amount: 0.1,
 *     challengePeriod: 86400 * 14, // 14 days
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
 * await Unicrow.core.pay({
 *     seller: "0xf463b32cad657fe03921014d99490A0a58290560",
 *     tokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
 *     amount: 100,
 *     buyer: "0xF257DD5731A679E6642FCd9c53e4e26A1206527e",
 *     arbitrator: "0x59f56CFC88E5660b7D68C4797c6484168eC8E068",
 *     arbitratorFee: 2,
 *     marketplace: "0x696207De45d897d5a353af3c45314a2F852d5B63",
 *     marketplaceFee: 10,
 *     challengePeriod: 86400 * 14, // 14 days
 *     challengePeriodExtension: 86400 * 7, // 7 days
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
 * @returns Details of the payment as returned by the contract's Pay event
 */
export const pay = async (
  paymentProps: IPaymentProps,
  callbacks?: IPayTransactionCallbacks,
): Promise<PayParsedPayload> => {
  const {
    amount,
    tokenAddress = ethers.ZeroAddress,
    seller,
    challengePeriod,
    marketplace,
    marketplaceFee = ZERO_FEE_VALUE,
    arbitrator,
    arbitratorFee = ZERO_FEE_VALUE,
    challengePeriodExtension = 0,
    paymentReference = "",
  } = paymentProps;

  callbacks && callbacks.connectingWallet && callbacks.connectingWallet();

  const provider = await getWeb3Provider();
  if (!provider) {
    throw new Error("Wallet not connected");
  }

  await autoSwitchNetwork(callbacks);

  const walletAddress = await getCurrentWalletAddress();
  callbacks && callbacks.connected && callbacks.connected(walletAddress);

  const buyer = paymentProps.buyer == null ? walletAddress : paymentProps.buyer;

  const providerSigner = await provider.getSigner();

  const marketplaceFeeValue = 100 * marketplaceFee;
  const arbitratorFeeValue = 100 * arbitratorFee;
  const marketplaceAddress = marketplace || ethers.ZeroAddress;
  const { addresses, token } = await validateParameters({
    //TODO: consider validating the reference, e.g. limiting its length
    seller,
    arbitrator,
    arbitratorFee: paymentProps.arbitratorFee,
    marketplace: marketplaceAddress,
    marketplaceFee: marketplaceFeeValue,
    challengePeriod: paymentProps.challengePeriod,
    challengePeriodExtension: paymentProps.challengePeriodExtension,
    tokenAddress,
    amount,
    buyer,
  });
  const _arbitrator = addresses.common.arbitrator || ethers.ZeroAddress;

  const solidityAmount = parseAmount(amount.toString(), token.decimals);
  const balance = await getBalance(tokenAddress);
  if (balance < solidityAmount) {
    throw new Error(`Insufficient balance: ${balance} < ${solidityAmount}`);
  }

  const unicrowAddress = getContractAddress("unicrow");

  if (tokenAddress !== ethers.ZeroAddress) {
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
    buyer: addresses.common.buyer,
    seller: addresses.common.seller,
    marketplace: addresses.common.marketplace,
    marketplaceFee: marketplaceFeeValue,
    currency: tokenAddress,
    challengePeriod,
    challengeExtension: challengePeriodExtension,
    amount: solidityAmount,
    paymentReference: paymentReference == null ? "" : paymentReference,
  };

  try {
    callbacks && callbacks.broadcasting && callbacks.broadcasting();

    const unicrowSc = Unicrow__factory.connect(unicrowAddress, providerSigner);

    let payTx: any;
    if (tokenAddress === ethers.ZeroAddress) {
      payTx = await unicrowSc.pay(
        walletAddress,
        payInput,
        _arbitrator,
        arbitratorFeeValue,
        {
          value: solidityAmount,
        },
      );
    } else {
      payTx = await unicrowSc.pay(
        walletAddress,
        payInput,
        _arbitrator,
        arbitratorFeeValue,
      );
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
