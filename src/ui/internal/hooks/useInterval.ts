import React from "react";

export const useInterval = (callback: VoidFunction, delay: number) => {
  const savedCallback = React.useRef<VoidFunction>();

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, []);
};
