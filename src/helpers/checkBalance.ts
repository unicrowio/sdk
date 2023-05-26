export const checkBalance = (balance: bigint, amount: bigint) => {
  if (balance < amount) {
    throw new Error("Insufficient Balance");
  }
};
