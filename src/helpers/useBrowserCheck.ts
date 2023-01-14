import React from "react";

export const useBrowserCheck = () => {
  const [isFirefox, setFirefox] = React.useState<boolean>(false);
  const [isChrome, setChrome] = React.useState<boolean>(false);
  const [isSafari, setSafari] = React.useState<boolean>(false);
  const [isIE, setIE] = React.useState<boolean>(false);
  const [isEdge, setEdge] = React.useState<boolean>(false);
  const [browserKey, setBrowserKey] = React.useState<string>("other");
  const [browserName, setBrowserName] = React.useState<string>("Other");

  React.useEffect(() => {
    const agent = window.navigator.userAgent.toLowerCase();

    const browserList = {
      edge: "MS Edge",
      edg: "Edge (chromium based)",
      chrome: "Chrome",
      trident: "MS IE",
      firefox: "Mozilla Firefox",
      safari: "Safari",
    };

    for (const key in browserList) {
      if (agent.indexOf(key) > -1) {
        setBrowserKey(key === "trident" ? "ie" : key); // nobody expects trident == IE
        setBrowserName(browserList[key]);
        break;
      }
    }
  }, [window?.navigator?.userAgent]);

  React.useEffect(() => {
    switch (browserKey) {
      case "firefox":
        setFirefox(true);
        break;
      case "chrome":
        setChrome(true);
        break;
      case "safari":
        setSafari(true);
        break;
      case "ie":
        setIE(true);
        break;
      case "edge":
        setEdge(true);
        break;
    }
  }, [browserKey]);

  return {
    browserKey,
    browserName,
    isFirefox,
    isChrome,
    isSafari,
    isIE,
    isEdge,
  };
};
