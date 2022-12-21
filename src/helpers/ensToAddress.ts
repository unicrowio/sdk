import { ethers } from 'ethers'


export const ensToAddress = async (ensName: string) => {
    const provider = new ethers.providers.JsonRpcProvider("https://purple-distinguished-vineyard.quiknode.pro/360bd2d54ace2ca5b775f1bf8325875fcd77204f/", 'mainnet')

    console.log({ ensName })

    const address = await provider.resolveName(ensName)

    console.log({ x: address })
    return address
}