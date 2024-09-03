import { ethers } from "ethers";

/**
 * Returns the user's provider
 *
 * @throws Error
 * If account is not connected (=no provider given).
 * @returns {ethers.providers.BrowserProvider}
 */
export const getBrowserProvider = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);

  if (!provider) {
    throw new Error("Could not get BrowserProvider");
  }

  return provider;
};
