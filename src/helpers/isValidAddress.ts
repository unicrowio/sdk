import { utils } from "ethers";

export const isValidAddress = (address: string) => {
	if (!address || address?.trim() === "") return false;
	return utils.isAddress(address.trim());
};
