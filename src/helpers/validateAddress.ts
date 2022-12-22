import { ensToAddress } from "./ensToAddress";
import { isValidAddress } from "./isValidAddress";

interface ValidAddressProps {
  [key: string]: string;
}

export interface AddressToReturn {
	ens?: ValidAddressProps;
	common?: ValidAddressProps;
}

export class InvalidAddressError extends Error {}

export const validateEns = async (
	addresses: ValidAddressProps,
): Promise<AddressToReturn> => {
	const addrs: AddressToReturn = {
		ens: {},
		common: {},
	};

	await Promise.all(
		Object.entries(addresses).map(async ([key, value]) => {
			if (!value) return;

			if (value && value.includes("eth")) {
				addrs.ens[key] = value;
				addrs.common[key] = await ensToAddress(value);
				return;
			}

			addrs.common[key] = value;
		}),
	);

	return addrs;
};

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
