import { createRoot } from "react-dom/client";
import React, { FunctionComponent } from "react";
import { tag } from "helpers";
import { jss } from "./jss";

// load Google fonts
if (typeof window !== "undefined") {
  const font1 = tag("link");
  font1.rel = "preconnect";
  font1.href = "https://fonts.googleapis.com";

  const font2 = tag("link");
  font2.rel = "preconnect";
  font2.href = "https://fonts.gstatic.com";
  font2.crossOrigin = "anonymous";

  const font3 = tag("link");
  font3.rel = "stylesheet";
  font3.href =
    "https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap";

  document.head.append(font1, font2, font3);
}

jss
  .createStyleSheet({
    "@global html, body": {
      fontFamily: `'Bai Jamjuree', 'Work Sans', sans-serif`,
      fontWeight: "400",
      margin: 0,
      boxSizing: "border-box",
      MozOsxFontSmoothing: "grayscale",
      WebkitFontSmoothing: "antialiased",
    },
  })
  .attach();

const ROOT_UNICROW_SDK_ELEMENT = "rootUnicrowSDkElement";

/**
 * Creates a modal within .rootUnicrowSDkElement (use props you want to pass to React.createElement for your component).
 */
export const renderModal = (component: FunctionComponent<any>, props?: any) => {
  let rootUnicrowSDkElement = document.getElementById(ROOT_UNICROW_SDK_ELEMENT);

  if (!rootUnicrowSDkElement) {
    rootUnicrowSDkElement = document.createElement("div");
    rootUnicrowSDkElement.id = ROOT_UNICROW_SDK_ELEMENT;
    document.documentElement.append(rootUnicrowSDkElement);
    const root = createRoot(rootUnicrowSDkElement!);
    root.render(React.createElement(component, props));
  }
};
