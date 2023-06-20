import { ethers } from "ethers";
import { getHost } from "../../config";

/**
 * Returns the url of the RPC provider.
 *
 * @throws Error
 * If account is not connected (=no provider given).
 * @returns {ethers.providers.JsonRpcProvider}
 */
export const getJsonRpcProvider = () => {
  const provider = new ethers.JsonRpcProvider(getHost(), "any");

  if (!provider) {
    throw new Error("Could not get provider");
  }

  return provider;
};
