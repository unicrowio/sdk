import { formatAmountToUSD } from "../formatAmountToUSD";

describe("test the function formatAmountToUSD", () => {
	it("should return 0.00 given 0", () => {
		const amount = 0;
		const exchangeValue = 1;
		const result = formatAmountToUSD(amount, exchangeValue);
		expect(result).toBe("0.00");
	});
	it("should return 0.99 given 0.9999", () => {
		const amount = 0.99;
		const exchangeValue = 1;
		const result = formatAmountToUSD(amount, exchangeValue);
		expect(result).toBe("0.99");
	});
});
