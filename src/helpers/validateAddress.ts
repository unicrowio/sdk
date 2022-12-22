import common from 'mocha/lib/interfaces/common';
import { ensToAddress } from './ensToAddress';
import { isValidAddress } from './isValidAddress'

interface ValidAddressProps {
  [key: string]: string
}

export interface AddrsToReturn {
  ens?: ValidAddressProps;
  common?: ValidAddressProps;
}

export class InvalidAddressError extends Error {}

export const validateEns = async (addresses: ValidAddressProps): Promise<AddrsToReturn> => {
  const addrs: AddrsToReturn = {
    ens: {},
    common: {}
  };

  await Promise.all(Object.entries(addresses).map(async (obj) => {
      if(!obj[1]) return;
      if (obj[1] && obj[1].includes('eth')) {
        addrs.ens[obj[0]] = await ensToAddress(obj[1])
      }  else {
        addrs.common[obj[0]] = obj[1]
      }
   }))
    
  return addrs
} 

export const validateAddress = (address: ValidAddressProps) => {
  if (Object.keys(address).length === 0) {
    throw new Error('You should provide an address')
  }

  const result = Object.entries(address)
    .map(item => {
      if (!isValidAddress(item[1])) {
        return `${item[0]} is an invalid address.`
      }
      return undefined
    })
    .filter(Boolean)

  if (result.length > 0) {
    throw new InvalidAddressError(result.join('\n'))
  }

  return true
}
