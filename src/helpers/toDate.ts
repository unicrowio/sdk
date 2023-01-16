import BigNumber from "bignumber.js";

/**
convert to date getting the BigNumber timestamp without milliseconds and
converting it to date with milliseconds
*/
export const toDate = (sec: BigNumber | number) =>
  BigNumber.isBigNumber(sec)
    ? new Date(sec.toNumber() * 1000)
    : new Date(sec * 1000);
