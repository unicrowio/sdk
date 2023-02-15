import { countdownChallengePeriod } from "helpers/countdownChallengePeriod";
import React from "react";

const hasExpired = (period: Date) => period && Date.now() > period.getTime();
const getCountdown = (date, prefix) =>
  prefix + " " + countdownChallengePeriod(date).replace(" remaining", "");

const getChallengedBy = (data) => {
  return data.status.latestChallengeBy === null
    ? "buyer"
    : data.status.latestChallengeBy;
};

const extractChallengeData = (data) => ({
  start: data.challengePeriodStart,
  end: data.challengePeriodEnd,
  connectedUser: data.connectedUser,
  neverChallenged: data.status.latestChallengeBy === null,
  challengedBy: getChallengedBy(data),
});

export const useCountdownChallengePeriod = (escrowData) => {
  const data = React.useRef<any>(escrowData);
  const challenge = React.useRef<any>(null);
  const timer = React.useRef<NodeJS.Timer>();
  const countdown = React.useRef<any>("...");
  const [canChallenge, setCanChallenge] = React.useState<boolean>(false);

  const startExpired = hasExpired(challenge.current?.start);
  const endExpired = hasExpired(challenge.current?.end);

  const updateChallenge = (newData) => {
    data.current = newData;
    challenge.current = {
      ...challenge.current,
      ...extractChallengeData(newData),
    };
    resetCountdown();
  };

  const startChallenge = () => {
    setCanChallenge(false);
    startCountdown();
  };

  const startCountdown = () => {
    timer.current && resetCountdown();
    timer.current = setInterval(() => {
      let prefix;
      let date;
      const { end, start, challengedBy, neverChallenged, connectedUser } =
        challenge.current;
      const challengedByYou = challengedBy === connectedUser;

      if (startExpired || neverChallenged) {
        date = end;
        prefix = "Ends in";
      } else {
        date = challengedByYou ? end : start;
        prefix = challengedByYou ? "Ends in" : "Begins in";
      }
      const _countdown = getCountdown(date, prefix);

      setCountdown(_countdown);
    }, 1000);
  };

  const setCountdown = (newValue) => {
    countdown.current = newValue;
  };

  const resetCountdown = () => {
    setCountdown("...");
    clearInterval(timer.current);
    timer.current = null;
  };

  const stopCountdown = () => {
    setCountdown("expired");
    setCanChallenge(false);
    clearInterval(timer.current);
  };

  React.useEffect(() => {
    if (escrowData) {
      const newData = JSON.stringify(escrowData);
      const oldData = JSON.stringify(data?.current);

      if (newData !== oldData) {
        updateChallenge(escrowData);
        setCanChallenge(
          challenge.current?.neverChallenged ||
            challenge.current?.challengedBy !==
              challenge.current?.connectedUser,
        );
      }
    }
  }, [escrowData, data?.current, challenge.current]);

  React.useEffect(() => {
    if (endExpired) {
      stopCountdown();
      return;
    }

    if (startExpired && countdown?.current === "Begins in -") {
      setCanChallenge(true);
      startCountdown();
      return;
    }

    if (!timer.current || countdown?.current === "...") {
      startCountdown();
      return;
    }
  }, [timer?.current, countdown.current, endExpired, startExpired]);

  return {
    labelChallengePeriod: "Challenge Period",
    countdown: countdown.current,
    challengedBy: challenge.current?.challengedBy,
    startChallenge,
    updateChallenge,
    canChallenge,
    startExpired,
  };
};
