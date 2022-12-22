import { ADDRESS_ZERO } from "./constants";
import { isSameAddress } from "./isSameAddress";

export const reduceAddress = (address: string, nonEnsAddress?: string) => {
  if (address === ADDRESS_ZERO) return '-';

  // it's an ens
  if (address.includes('.')) {

    const start = nonEnsAddress.substring(0, 6)
    const middle = '...'
    const end = nonEnsAddress.substring(nonEnsAddress.length - 4)

    const loading = nonEnsAddress.includes(".")

    if(loading) return `${address} (loading...)`
    
    return `${address} (${start}${middle}${end})`
  }

	const start = address.substring(0, 6);
	const middle = "...";
	const end = address.substring(address.length - 4);

	return `${start}${middle}${end}`;
};

export const addressWithYou = (address: string, currentUserAddress: string, nonEnsAddress?: string) => {
  return isSameAddress(address, currentUserAddress)
    ? `You (${reduceAddress(address, nonEnsAddress)})`
    : reduceAddress(address, nonEnsAddress)
}
