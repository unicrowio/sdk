import { IValidateProps } from "../../typing";
import { validateParameters } from "../validateParameters";

const params: IValidateProps = {
  seller: "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62",
  buyer: "0x484Ee4Eb8CB165F4FBFd897f84283142C8f1fD3a",
  arbitrator: "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62",
  marketplace: "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62",
  amount: 1,
  challengePeriod: 1,
  challengePeriodExtension: 1,
  arbitratorFee: 1,
  marketplaceFee: 1,
  tokenAddress: "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62",
};

describe("Valid payments function", () => {
  it("Should not throw an error ", async () => {
    await validateParameters(params);
  });

  it("Should throw an error given an invalid seller address ", async () => {
    await expect(
      validateParameters({
        ...params,
        seller: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
      }),
    ).rejects.toThrow("seller is invalid: 0x7bD733DBc10A1cD04e1e51cC89450941c928.");
  });

  it("Should throw an error given an invalid marketplace address ", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        marketplace: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
      }),
    ).rejects.toThrow("marketplace is invalid: 0x7bD733DBc10A1cD04e1e51cC89450941c928.");
  });

  it("Should throw an error given an invalid arbitrator address ", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        marketplace: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
      }),
    ).rejects.toThrow("marketplace is invalid: 0x7bD733DBc10A1cD04e1e51cC89450941c928.");
  });

  it("Should throw an error given an invalid token address ", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        marketplace: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
      }),
    ).rejects.toThrow("marketplace is invalid: 0x7bD733DBc10A1cD04e1e51cC89450941c928.");
  });

  it("Should throw an error given invalid amount", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        amount: 0,
      }),
    ).rejects.toThrow(/Invalid amount/);
  });

  it("Should throw an error given invalid challenge period", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        challengePeriod: -5,
      }),
    ).rejects.toThrow(/Invalid challenge period/);
  });

  it("Should throw an error given invalid challenge period extension", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        challengePeriodExtension: -5,
      }),
    ).rejects.toThrow(/Invalid challenge period extension/);
  });

  it("Should throw an error given invalid arbitrator fee", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        arbitratorFee: -1,
      }),
    ).rejects.toThrow(/Invalid arbitrator fee/);
  });

  it("Should throw an error given invalid marketplace fee", async () => {
    await expect(async () =>
      validateParameters({
        ...params,
        marketplaceFee: -5,
      }),
    ).rejects.toThrow(/Invalid marketplace fee/);
  });
});
