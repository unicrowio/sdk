import * as React from "react";
import { SVGProps } from "react";

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={14}
    height={14}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.607 1.207a.575.575 0 0 0-.813-.814L7 6.187 1.207.393a.575.575 0 1 0-.813.814L6.187 7 .394 12.793a.575.575 0 0 0 .813.814L7 7.813l5.793 5.794a.575.575 0 0 0 .814-.814L7.813 7l5.794-5.793Z"
      fill="#252E47"
    />
  </svg>
);
