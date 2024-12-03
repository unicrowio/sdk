/**
 * Round a percentage to max 2 decimals.
 * If amount > 100, returns 100
 * If amount < 0, returns 0
 */
export const roundPercentage = (amount: number) => {
  if (amount > 100) {
    return 100;
  }

  if (amount < 0) {
    return 0;
  }

  return Math.round(Number(amount) * 100) / 100;
};
