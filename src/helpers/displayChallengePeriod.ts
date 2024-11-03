import { DateTime } from "luxon";

interface IDiff {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const formatDate = (diff: IDiff): string => {
  const { days, hours, minutes, seconds } = diff;

  let formattedString = "-";

  if (days > 0) {
    formattedString = `${days}d ${hours > 0 ? hours : ""}${
      hours > 0 ? "h" : ""
    }`;
  } else if (hours > 0) {
    formattedString = `${hours}h ${minutes > 0 ? minutes : ""}${
      minutes > 0 ? "min" : ""
    }`;
  } else if (minutes > 0) {
    formattedString = `${minutes}min ${seconds > 0 ? seconds : ""}${
      seconds > 0 ? "sec" : ""
    }`;
  } else if (seconds > 0) {
    formattedString = `${seconds}sec`;
  }

  return formattedString;
};

export const displayChallengePeriod = (
  challengePeriod: number,
  useLongFormat?: boolean,
): string => {
  if (challengePeriod <= 0) {
    return "-";
  }

  const now = DateTime.now();
  const period = now.plus({ seconds: challengePeriod });

  const diff = period.diff(now, ["days", "hours", "minutes", "seconds"]);

  return useLongFormat
    ? formatDate(diff)
        .replace("d", " days")
        .replace("h", " hours")
        .replace("min", " minutes")
        .replace("sec", " seconds")
        // if there is only one of an unit, remove the 's'
        .replace("1 days", "1 day")
        .replace("1 hours", "1 hour")
        .replace("1 minutes", "1 minute")
        .replace("1 seconds", "1 second")
    : formatDate(diff);
};
