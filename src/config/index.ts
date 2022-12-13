import { networks } from '../wallet/networks'
import initNetworks from './init'

export const RPC_HOST =
  globalThis?.defaultNetwork?.rpcUrl || networks?.arbitrum?.rpcUrls[0]

export const UNICROW_ADDRESS = '0x1e8d308cA9b8098cB2D9EfBf54992B252f7CaAc0'
export const UNICROW_DISPUTE_ADDRESS =
  '0xA60b443FAef64ce299C31671a180e0309d6619D1'
export const UNICROW_ARBITRATOR_ADDRESS =
  '0x0Ae4B7FA978e3A21eb05444533d5744e02c9E095'
export const CROW_REWARDS_ADDRESS = '0xfC5cac9F4f8f286bA227402060786Cb20A13C704'
export const CROW_STAKING_ADDRESS = '0x1494A9b31ED5f4Ba7B993A7E3a6374627841bC9E'
export const CROW_TOKEN_ADDRESS = '0xcce514eCBc99dbeaA2a809dCc137B57524fd5aaE'
export const CROW_LIST_TOKENS = '0x2ec213411e2D31AE0e8b514b869F1d66951Ca1a0'
export const UNICROW_CLAIM_ADDRESS = '0x85bD5aC27e86DD74ef5e9dba6dc5D2DF732bAE67'

initNetworks({
  autoSwitchNetwork: false,
  defaultNetwork: 'arbitrum'
})
