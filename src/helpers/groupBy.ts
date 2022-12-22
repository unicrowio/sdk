export const groupBy = <T, K extends keyof any>(
	array: T[],
	getKey: (item: T) => K,
) =>
	array.reduce((acc, current) => {
		const group = getKey(current);
		if (!acc[group]) acc[group] = [];
		acc[group].push(current);
		return acc;
	}, {} as Record<K, T[]>);
