import { ERC20__factory } from '@unicrowio/ethers-types'
import { getWeb3Provider, getWalletAccount, autoSwitchNetwork } from '../wallet'
import { ETH_ADDRESS } from '../helpers/constants'
import { BigNumber } from 'ethers'

/**
 * Checks if the user has the funds to pay for the given amount of tokens.
 * This function should be called only to verify the users' balance of ERC20 tokens.
 *
 * @returns {Promise<BigNumber>}
 */
export const getBalance = async (tokenAddress: string): Promise<BigNumber> => {
  const provider = await getWeb3Provider()
  const currentAccount = await getWalletAccount()

  if (!provider || !currentAccount) {
    throw new Error('Error on Get Balance, Account Not connected')
  }

  autoSwitchNetwork()

  if (tokenAddress === ETH_ADDRESS) {
    return provider.getBalance(currentAccount)
  } else {
    const token = ERC20__factory.connect(tokenAddress, provider.getSigner())
    return token.balanceOf(currentAccount)
  }
}
