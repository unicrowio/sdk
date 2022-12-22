import { ADDRESS_ZERO } from "./constants";
import { isSameAddress } from "./isSameAddress";

export const reduceAddress = (address: string, ensAddress?: string) => {
  if (address === ADDRESS_ZERO) return '-';

  // it's an ens
  if (ensAddress && ensAddress.includes('.')) {

    const start = address.substring(0, 6)
    const middle = '...'
    const end = address.substring(address.length - 4)

    const loading = address.includes(".")

    if(loading) return `${address} (loading...)`
    
    return `${ensAddress} (${start}${middle}${end})`
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
