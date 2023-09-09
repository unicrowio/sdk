import { ensToAddress } from "./ensToAddress";
import { isValidAddress } from "./isValidAddress";

interface ValidAddrsProps {
  [key: string]: string;
}

export interface ResolvedAddrs {
  ens?: ValidAddrsProps;
  common?: ValidAddrsProps;
}

export class InvalidAddressError extends Error {}

export const resolveEns = async (
  addresses: ValidAddrsProps,
): Promise<ResolvedAddrs> => {
  const addrs: ResolvedAddrs = {
    ens: {},
    common: {},
  };

  await Promise.all(
    Object.entries(addresses).map(async ([key, value]) => {
      if (!value) return;

      if (value.includes(".eth")) {
        addrs.ens[key] = value;
        addrs.common[key] = await ensToAddress(value);
        return;
      }

      addrs.common[key] = value;
    }),
  );

  return addrs;
};

export const validateAddresses = (address: ValidAddrsProps) => {
  if (Object.keys(address).length === 0) {
    throw new InvalidAddressError("No addresses provided.");
  }

  for (const item of Object.entries(address)) {
    if (!isValidAddress(item[1])) {
      throw new InvalidAddressError(
        `Address: ${item[1]} (${item[0]}) is invalid.`,
      );
    }
  }

  return true;
};
