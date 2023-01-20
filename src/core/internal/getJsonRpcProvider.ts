import { ethers } from "ethers";
import { getHost } from "../../config";
/**
 * Returns the url of the RPC provider.
 *
 * @throws Error
 * If account is not connected (=no provider given).
 * @returns {ethers.providers.JsonRpcProvider} the json rpc provider of a given network
 */
export const getJsonRpcProvider = () => {
  const provider = new ethers.providers.JsonRpcProvider(getHost(), "any");

  if (!provider) {
    throw new Error("Could not get provider");
  }

  return provider;
};
