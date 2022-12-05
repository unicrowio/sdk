import { ADDRESS_ZERO } from './constants'
import { isSameAddress } from './isSameAddress'

export const reduceAddress = (address: string) => {
  if (address === ADDRESS_ZERO) return '-'

  // it's an ens
  if (address.includes('.')) return address

  const start = address.substring(0, 6)
  const middle = '...'
  const end = address.substring(address.length - 4)

  return `${start}${middle}${end}`
}

export const addressWithYou = (address: string, currentUserAddress: string) => {
  return isSameAddress(address, currentUserAddress)
    ? `You (${reduceAddress(address)})`
    : reduceAddress(address)
}
