import { networks } from '../wallet/networks'
import initNetworks from './init'

export let RPC_HOST =
  globalThis?.defaultNetwork?.rpcUrl || networks?.arbitrum?.rpcUrls[0]

// Arbitrum mainnet Unicrow Contract Addresses
const Arbitrum = {
  unicrow: '0xFEf5DA5c801c137632D51d4ccec16e9a89A91deC',
  dispute: '0xE5758Fe00EebFA200cE0e1e8818eedC6b8101aDb',
  arbitrator: '0x6c3c223F8b5430b6E8D1bC2D2F2377503AC6Ffb8',
  claim: '0xdDfDCa767F9143B804740aFA8087A286E087dF13'
}

// Private RPC development Unicrow Contract Addresses
const Private = {
  unicrow: '0x1e8d308cA9b8098cB2D9EfBf54992B252f7CaAc0',
  dispute: '0xA60b443FAef64ce299C31671a180e0309d6619D1',
  arbitrator: '0x0Ae4B7FA978e3A21eb05444533d5744e02c9E095',
  claim: '0x85bD5aC27e86DD74ef5e9dba6dc5D2DF732bAE67'
}

export let UNICROW_ADDRESS =
  globalThis.defaultNetwork.name == 'arbitrum'
    ? Arbitrum.unicrow
    : Private.unicrow
export let UNICROW_DISPUTE_ADDRESS =
  globalThis.defaultNetwork.name == 'arbitrum'
    ? Arbitrum.dispute
    : Private.dispute
export let UNICROW_ARBITRATOR_ADDRESS =
  globalThis.defaultNetwork.name == 'arbitrum'
    ? Arbitrum.arbitrator
    : Private.arbitrator

export let UNICROW_CLAIM_ADDRESS =
  globalThis.defaultNetwork.name == 'arbitrum' ? Arbitrum.claim : Private.claim

// Not been used yet
export let CROW_LIST_TOKENS = ''

initNetworks({
  autoSwitchNetwork: false,
  defaultNetwork: 'arbitrum'
})
