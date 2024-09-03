import { Unicrow__factory } from "@unicrowio/ethers-types";
import { getContractAddress } from "../config";
import { bipsToPercentage } from "../helpers";
import { getBrowserProvider } from "./internal/getBrowserProvider";

/**
 * Retrieves information about the protocol fee and returns its percentage.
 * If you need to have it in bips, multiply by 100.
 *
 * @returns The protocol fee in percentage
 */
export const getProtocolFee = async () => {
  const smartContract = Unicrow__factory.connect(
    getContractAddress("unicrow"),
    getBrowserProvider(),
  );

  const fee = await smartContract.protocolFee();

  const [feeInPercentage] = bipsToPercentage([fee]);

  return feeInPercentage;
};
