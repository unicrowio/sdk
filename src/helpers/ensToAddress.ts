import { ethers } from 'ethers'

const MAINNET_NODE = "https://purple-distinguished-vineyard.quiknode.pro/360bd2d54ace2ca5b775f1bf8325875fcd77204f/";

export const ensToAddress = async (ensName: string) => {
    const provider = new ethers.providers.JsonRpcProvider(MAINNET_NODE, 'mainnet')
    const address = await provider.resolveName(ensName)
    return address
}