import { BigNumber as BigNumberJs } from "bignumber.js";
import { utils } from "ethers";

export const parse = (
	value: string | number | BigNumberJs,
	decimals: number,
) => {
	try {
		return utils.parseUnits(String(value), decimals);
	} catch (error) {
		console.error(error);
		throw new Error("Invalid amount value");
	}
};
