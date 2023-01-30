import React, { SVGProps } from "react";

export const BigCheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={44}
    height={44}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={22} cy={22} r={22} fill="#00D615" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M28.642 16.277c.289.189.37.576.181.865l-6.8 10.4a.625.625 0 0 1-.944.12l-4.4-4a.625.625 0 0 1 .841-.924l3.858 3.506 6.399-9.786a.625.625 0 0 1 .865-.181Z"
      fill="#fff"
    />
  </svg>
);
