import { BigNumber } from 'ethers'

export const checkBalance = (balance: BigNumber, amount: BigNumber) => {
  if (balance.lt(amount)) {
    throw new Error('Insufficient Balance')
  }
}
