/**
 * convert percetage to bips multplying (*) the value by 100
 * @returns
 */
export const percentageToBips = (values: number[]) =>
  values.map(value => value * 100)
