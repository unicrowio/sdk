export const formatToUSD = (amount: number) => {
	const inDollar = new Intl.NumberFormat("en-EN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	return inDollar.format(amount);
};
