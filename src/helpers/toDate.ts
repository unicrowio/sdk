import BigNumber from "bignumber.js";

/**
convert to date getting the BigNumber timestamp without milliseconds and
converting it to date with milliseconds
*/
export const toDate = (sec: BigNumber) => new Date(sec.toNumber() * 1000);
