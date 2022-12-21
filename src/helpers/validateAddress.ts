import { ensToAddress } from './ensToAddress';
import { isValidAddress } from './isValidAddress'

interface ValidAddressProps {
  [key: string]: string
}

export class InvalidAddressError extends Error {}

export const validateEns = async (addresses: ValidAddressProps) => {
  const addrs = {};

  await Promise.all(Object.entries(addresses).map(async (obj) => {
      if(!obj[1]) return;

      if (obj[1] && obj[1].includes('eth')) {
        addrs[obj[0]] = await ensToAddress(obj[1])
      }  else {
        addrs[obj[0]] = obj[1]
      }
   }))
    
    console.log({ addrs })

  return addrs
} 

export const validateAddress = (address: ValidAddressProps) => {
  if (Object.keys(address).length === 0) {
    throw new Error('You should provide an address')
  }

  console.log({yxz: address})

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
