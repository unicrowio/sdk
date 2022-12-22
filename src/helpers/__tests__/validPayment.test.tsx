import { IPaymentProps } from "../../typing";
import { validateParameters } from "../validateParameters";

const params: IPaymentProps = {
	seller: "0x7bD733DBc10A1cD04e1e51cC89450941c928ee62",
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
	it("Should not throw an error ", () => {
		validateParameters(params);
	});

	it("Should throw an error given an invalid seller address ", () => {
		expect(() =>
			validateParameters({
				...params,
				seller: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
			}),
		).toThrow(/seller is an invalid address./);
	});

	it("Should throw an error given an invalid marketplace address ", () => {
		expect(() =>
			validateParameters({
				...params,
				marketplace: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
			}),
		).toThrow(/marketplace is an invalid address./);
	});

	it("Should throw an error given an invalid arbitrator address ", () => {
		expect(() =>
			validateParameters({
				...params,
				marketplace: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
			}),
		).toThrow(/marketplace is an invalid address./);
	});

	it("Should throw an error given an invalid token address ", () => {
		expect(() =>
			validateParameters({
				...params,
				marketplace: "0x7bD733DBc10A1cD04e1e51cC89450941c928",
			}),
		).toThrow(/marketplace is an invalid address./);
	});

	it("Should throw an error given invalid amount", () => {
		expect(() =>
			validateParameters({
				...params,
				amount: 0,
			}),
		).toThrow(/Invalid amount/);
	});

	it("Should throw an error given invalid challenge period", () => {
		expect(() =>
			validateParameters({
				...params,
				challengePeriod: -5,
			}),
		).toThrow(/Invalid challenge period/);
	});

	it("Should throw an error given invalid challenge period extension", () => {
		expect(() =>
			validateParameters({
				...params,
				challengePeriodExtension: -5,
			}),
		).toThrow(/Invalid challenge period extension/);
	});

	it("Should throw an error given invalid arbitrator fee", () => {
		expect(() =>
			validateParameters({
				...params,
				arbitratorFee: -1,
			}),
		).toThrow(/Invalid arbitrator fee/);
	});

	it("Should throw an error given invalid marketplace fee", () => {
		expect(() =>
			validateParameters({
				...params,
				marketplaceFee: -5,
			}),
		).toThrow(/Invalid marketplace fee/);
	});
});
