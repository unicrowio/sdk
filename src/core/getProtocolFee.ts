import { Unicrow__factory } from "@unicrowio/ethers-types";
import { getContractsAddresses } from "../config";
import { bipsToPercentage } from "../helpers";
import { getWeb3Provider } from "../wallet";

/**
 * Retrieves information about the protocol fee and returns its percentage.
 * If you need to have it in bips, multiply by 100.
 *
 * @returns The protocol fee in percentage
 */
export const getProtocolFee = async () => {
  let provider = getWeb3Provider();

  const smartContract = Unicrow__factory.connect(
    (await getContractsAddresses()).unicrow,
    provider,
  );

  const fee = await smartContract.protocolFee();

  const [feeInPercentage] = bipsToPercentage([fee]);

  return feeInPercentage;
};
