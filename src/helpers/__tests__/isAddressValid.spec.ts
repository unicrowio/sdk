import { constants } from 'ethers'
import { InvalidAddressError, validateAddress } from '../validateAddress'

describe('test the function validateAddress', () => {
  it('should return true given a valid address', () => {
    const buyer = '0x7bD733DBc10A1cD04e1e51cC89450941c928ee62'
    const seller = '0x7bD733DBc10A1cD04e1e51cC89450941c928ee62'

    const result = validateAddress({ buyer, seller })
    expect(result).toBe(true)
  })

  it('should throw an error given an invalid address', () => {
    const buyer = '0x7bD733DBc10A1cD04e1e51cC89450941c928ee62'
    const seller = '0x00000-invalid-address'

    const fn = () => validateAddress({ buyer, seller })
    expect(fn).toThrow(InvalidAddressError)
  })

  it('should throw an error given an invalid object as parameter', () => {
    const fn = () => validateAddress({})
    expect(fn).toThrow(/You should provide an address/)
  })

  it('should accept constants.AddressZero as address', () => {
    const addressZero = constants.AddressZero
    const fn = () => validateAddress({ addressZero })

    expect(fn).not.toThrow()
  })

  it('should accept 0x0000000000000000000000000000000000000123 as address', () => {
    const customAddress = '0x0000000000000000000000000000000000000123'
    const result = validateAddress({ customAddress })

    expect(result).toBe(true)
  })
})
