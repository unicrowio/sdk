import { IPaymentProps } from "../typing";
import { validateAddress } from "./validateAddress";

interface AddressesToCheck {
	arbitrator?: string;
	marketplace?: string;
	seller: string;
	tokenAddress?: string;
}

export const validateParameters = (data: IPaymentProps) => {
	const {
		seller,
		arbitrator,
		marketplace,
		amount,
		challengePeriod,
		challengePeriodExtension,
		arbitratorFee,
		marketplaceFee,
		tokenAddress,
	} = data;

	const addressesToCheck: AddressesToCheck = {
		seller,
	};

	if (arbitrator) {
		addressesToCheck.arbitrator = arbitrator;
	}

	if (marketplace) {
		addressesToCheck.marketplace = marketplace;
	}

	if (tokenAddress) {
		addressesToCheck.tokenAddress = tokenAddress;
	}

	try {
		validateAddress({ ...addressesToCheck });
	} catch (e: any) {
		throw new Error(e.message);
	}

	if (amount <= 0) {
		throw new Error("Invalid amount");
	}

	if (!Number.isInteger(challengePeriod) || challengePeriod < 0) {
		throw new Error("Invalid challenge period");
	}

	if (
		Number.isNaN(challengePeriodExtension) ||
		(typeof challengePeriodExtension !== "undefined" &&
			challengePeriodExtension <= 0)
	) {
		throw new Error("Invalid challenge period extension");
	}

	if (
		Number.isNaN(arbitratorFee) ||
		(typeof arbitratorFee !== "undefined" && arbitratorFee < 0)
	) {
		throw new Error("Invalid arbitrator fee");
	}

	if (
		Number.isNaN(marketplaceFee) ||
		(typeof marketplaceFee !== "undefined" && marketplaceFee < 0)
	) {
		throw new Error("Invalid marketplace fee");
	}
};
