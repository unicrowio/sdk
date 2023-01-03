import { ADDRESS_ZERO } from "./constants";
import { isSameAddress } from "./isSameAddress";

export const reduceAddress = (address: string, ensAddress?: string) => {
  if (address === ADDRESS_ZERO || !address) return "-";

  const shortAddress = address.replace(
    address.substring(6, address.length - 4),
    "...",
  );

  // it's an ens
  if (ensAddress && ensAddress.includes(".")) {
    const loading = address.includes(".");

    if (loading) return `${address} (loading...)`;

    return `${ensAddress} (${shortAddress})`;
  }

  return `${shortAddress}`;
};

export const addressWithYou = (
  address: string,
  currentUserAddress: string,
  nonEnsAddress?: string,
) => {
  return isSameAddress(address, currentUserAddress)
    ? `You (${reduceAddress(address, nonEnsAddress)})`
    : reduceAddress(address, nonEnsAddress);
};
