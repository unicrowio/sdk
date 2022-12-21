import { getHost } from 'config'
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider(getHost())

export const ensToAddress = async (ensName: string) => {
    const address = await provider.resolveName(ensName)
    return address
}