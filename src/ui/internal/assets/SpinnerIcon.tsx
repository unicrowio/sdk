import React, { SVGProps } from "react";

export const SpinnerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 4.75v1.5M17.127 6.874l-1.061 1.06M19.25 12h-1.5M17.127 17.127l-1.061-1.061M12 17.75v1.5M7.934 16.066l-1.06 1.06M6.25 12h-1.5M7.934 7.934l-1.06-1.06"
      stroke="#FDFCFF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
