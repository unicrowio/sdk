/**
 * convert bips to percentage dividing (/) the value by 100
 * @param values
 * @returns
 */
export const bipsToPercentage = (values: number[]) =>
  values.map(value => value / 100)
