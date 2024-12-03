import { ethers } from "ethers";

export const nullOrValue = (value: any) =>
  !value || value === ethers.ZeroAddress ? null : value?.toString();
