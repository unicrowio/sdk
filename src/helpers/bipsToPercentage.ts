/**
 * convert bips to percentage dividing (/) the value by 100
 * @returns
 */
export const bipsToPercentage = (values: number[] | bigint[]) =>
  values.map((value) => Number(value) / 100);
