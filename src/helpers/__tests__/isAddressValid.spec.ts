import { ethers } from "ethers";
import { InvalidAddressError, validateAddresses } from "../validateAddresses";

describe("test the function validateAddress", () => {
  it("should return true given a valid address", () => {
    const buyer = "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62";
    const seller = "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62";

    const result = validateAddresses({ buyer, seller });
    expect(result).toBe(true);
  });

  it("should throw an error given an invalid address", () => {
    const buyer = "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62";
    const seller = "0x00000-invalid-address";

    const fn = () => validateAddresses({ buyer, seller });
    expect(fn).toThrow(InvalidAddressError);
  });

  it("should throw an error given an invalid object as parameter", () => {
    const fn = () => validateAddresses({});
    expect(fn).toThrow(/No addresses provided/);
  });

  it("should accept constants.AddressZero as address", () => {
    const addressZero = ethers.ZeroAddress;
    const fn = () => validateAddresses({ addressZero });

    expect(fn).not.toThrow();
  });

  it("should accept 0x0000000000000000000000000000000000000123 as address", () => {
    const customAddress = "0x0000000000000000000000000000000000000123";
    const result = validateAddresses({ customAddress });

    expect(result).toBe(true);
  });
});
