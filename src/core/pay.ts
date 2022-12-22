import { ERC20__factory, Unicrow__factory } from "@unicrowio/ethers-types";
import {
  NULL_ARBITRATOR_ADDRESS,
  ZERO_FEE_VALUE,
  NULL_MARKETPLACE_ADDRESS,
  ETH_ADDRESS,
} from "../helpers/constants";
import { getContractAddress } from "../config";
import {
  IPaymentProps,
  IPayTransactionCallbacks,
  PayParsedPayload,
} from "../typing";
import { getBalance } from "./getBalance";
import { getTokenInfo } from "../core/getTokenInfo";
import { errorHandler } from "./errorHandler";

import {
  getWeb3Provider,
  getWalletAccount,
  autoSwitchNetwork,
} from "../wallet/index";
import { EscrowInputStruct } from "@unicrowio/ethers-types/src/Unicrow";

import { validateParameters } from "../helpers/validateParameters";
import { parsePay } from "parsers/eventPay";
import { checkBalance, parse } from "../helpers";
import { BigNumberish } from "ethers";

/**
 * Deposits a payment into an escrow and returns its data.
 *
 * @example
 * Here's a simple example:

 * ```
   const result: PayParsedPayload = await crowSdk.ui.pay(
      {
        amount: '90',
        seller: '0x952e927887aB169761f727E36c5f8e10837E1A6d',
        challengePeriod: ONE_DAY_IN_SEC * 1, // 1 day
        marketplace: '0xaB7ce38086209b640cc88c67A24C1837540EbD8b',
        marketplaceFee: 10
      },
      {
        confirmed: (data: any) => {
          console.log('confirmed')
          console.log(data)
        }
      }
    )
    console.log(result)
    /** Prints "{result: {
          * "amount": 90,
          * "challengePeriod": "86400",
          * "challengePeriodExtension": "0",
          * "marketplace": "0xaB7ce38086209b640cc88c67A24C1837540EbD8b",
          * "marketplaceFee": "10",
          * "seller": "0x952e927887aB169761f727E36c5f8e10837E1A6d",
          * "tokenAddress": "0x1c1D0Aa63e3A51Dcc36fFF956b6c5979905B357E",
          * "arbitrator": "0x8BB3928bAbd270008F69C5Eeb5439e06487ccfe1",
          * "arbitratorFee": 2,
          * "challengePeriodExtension": 0,
      * }}"
 * ```
   * @throws Error
 * If account is not connected (=no provider given) or token info doesn't exist (or sth. else went wrong).
 * @returns {Promise<PayParsedPayload>}
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

	callbacks?.connectingWallet && callbacks.connectingWallet();
	const provider = await getWeb3Provider();

	if (!provider) {
		throw new Error("Wallet not connected");
	}

	await autoSwitchNetwork(callbacks);

	callbacks?.connected && callbacks.connected();

	const providerSigner = provider.getSigner();

	const tokenInfo = await getTokenInfo(tokenAddress);

	if (!tokenInfo) {
		throw new Error("Could not get token info");
	}

	const walletUser = await getWalletAccount();

	const UNICROW_ADDRESS = getContractAddress("unicrow");

	let bigNumberAmount: BigNumberish;
	if (tokenAddress === ETH_ADDRESS) {
		bigNumberAmount = parse(amount, 18);
		const balance = await getBalance(tokenAddress);
		checkBalance(balance, bigNumberAmount);
	} else {
		const token = ERC20__factory.connect(tokenAddress, providerSigner);
		const tokenDecimalNumber = await token.decimals();

		bigNumberAmount = parse(amount, tokenDecimalNumber);
		const balance = await getBalance(tokenAddress);
		checkBalance(balance, bigNumberAmount);

		const alreadyAllowedAmount = await token.allowance(
			walletUser!,
			UNICROW_ADDRESS,
		);

		// Checking with equals because previous allowance value was not related to this new transaction.
		// TODO: Maybe we should approve an infinity amount to contract in order to prevent this transaction request
		if (alreadyAllowedAmount.lt(bigNumberAmount)) {
			// Allowing as close as we can to infinity
			const approveTx = await token.approve(UNICROW_ADDRESS, bigNumberAmount);
			// This transaction supposed to be mined very fast
			await approveTx.wait();
		}
	}

	const smartContract = Unicrow__factory.connect(
		UNICROW_ADDRESS,
		providerSigner,
	);

	callbacks?.broadcasting && callbacks.broadcasting();

	// solidity doesn't work with decimal points
	const marketplaceFeeValue = 100 * marketplaceFee;
	const arbitratorFeeValue = 100 * arbitratorFee;
	const marketplaceAddress = marketplace || NULL_MARKETPLACE_ADDRESS;

	const addrs = await validateParameters({
		seller,
		arbitrator,
		arbitratorFee: paymentProps.arbitratorFee,
		marketplace: marketplaceAddress,
		marketplaceFee: marketplaceFeeValue,
		challengePeriod: paymentProps.challengePeriod,
		challengePeriodExtension: paymentProps.challengePeriodExtension,
		tokenAddress,
		amount,
	});

	const _arbitrator = addrs.common.arbitrator || NULL_ARBITRATOR_ADDRESS;

	const payInput: EscrowInputStruct = {
		seller: addrs.common.seller,
		marketplace: addrs.common.marketplace,
		marketplaceFee: marketplaceFeeValue,
		currency: tokenAddress,
		challengePeriod,
		challengeExtension: challengePeriodExtension,
		amount: bigNumberAmount,
	};

	try {
		let payTx: any;

		const isETH = tokenAddress === ETH_ADDRESS;
		// { value: bigNumberAmount } should be passed only in case of Ethers
		if (isETH) {
			payTx = await smartContract.pay(
				payInput,
				_arbitrator,
				arbitratorFeeValue,
				{
					value: bigNumberAmount,
				},
			);
		} else {
			payTx = await smartContract.pay(
				payInput,
				_arbitrator,
				arbitratorFeeValue,
			);
		}

		callbacks?.broadcasted &&
			callbacks.broadcasted({
				transactionHash: payTx.hash,
				buyer: walletUser!,
			});

		const receiptTx = await payTx.wait();

		const parsedPayload = parsePay(receiptTx.events);

		callbacks?.confirmed && callbacks.confirmed(parsedPayload);

		return parsedPayload;
	} catch (error) {
		const errorMessage = errorHandler(error);
		throw new Error(errorMessage);
	}
};
