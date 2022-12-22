import { isValidAddress } from "./isValidAddress";

interface ValidAddressProps {
	[key: string]: string;
}

export class InvalidAddressError extends Error {}

export const validateAddress = (address: ValidAddressProps) => {
	if (Object.keys(address).length === 0) {
		throw new Error("You should provide an address");
	}

	const result = Object.entries(address)
		.map((item) => {
			if (!isValidAddress(item[1])) {
				return `${item[0]} is an invalid address.`;
			}
			return undefined;
		})
		.filter(Boolean);

	if (result.length > 0) {
		throw new InvalidAddressError(result.join("\n"));
	}

	return true;
};
