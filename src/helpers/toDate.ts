/**
convert to date getting the BigInt timestamp without milliseconds and
converting it to date with milliseconds

Every timestamp that come from the blockchain should be passed by this function
The blockchain provide the timestamp without the milleseconds.

So the fields:
challenge_period_start, challenge_period_end, paid_at, release_at, ...etc_at,
should use this function to parse the seconds in valid date.
*/

export const toDate = (seconds: bigint | number) =>
  typeof seconds === "bigint"
    ? new Date(Number(seconds) * 1000)
    : new Date(seconds * 1000);
