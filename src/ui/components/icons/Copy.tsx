import * as React from "react";
import { SVGProps } from "react";

export const CopyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={12}
    height={12}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M.7 7.4a1.5 1.5 0 0 0 1.5 1.5h.9v.9a1.5 1.5 0 0 0 1.5 1.5h5.2a1.5 1.5 0 0 0 1.5-1.5V4.6a1.5 1.5 0 0 0-1.5-1.5h-.9v-.9A1.5 1.5 0 0 0 7.4.7H2.2A1.5 1.5 0 0 0 .7 2.2v5.2Zm7.2-4.3v-.9a.5.5 0 0 0-.5-.5H2.2a.5.5 0 0 0-.5.5v5.2a.5.5 0 0 0 .5.5h.9V4.6a1.5 1.5 0 0 1 1.5-1.5h3.3ZM4.1 4.6a.5.5 0 0 1 .5-.5h5.2a.5.5 0 0 1 .5.5v5.2a.5.5 0 0 1-.5.5H4.6a.5.5 0 0 1-.5-.5V4.6Z"
      fill="#C8CBD0"
    />
  </svg>
);
