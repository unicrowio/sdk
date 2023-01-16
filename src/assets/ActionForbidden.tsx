import React, { SVGProps } from "react";

export const ActionForbidden = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={236}
    height={176}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M141.713 99.811 64.816 22.883c-8.094-8.25-21.534-8.49-29.883-.435-2.91 2.69-4.904 6.2-5.84 9.903L.933 138.082c-1.492 11.414 6.747 21.922 18.34 23.343 2.303.228 4.675.138 6.948-.324l105.606-28.192c5.333-1.73 9.677-5.415 12.282-10.39 2.601-4.989 3.076-10.696 1.347-15.976-.761-2.254-1.86-4.326-3.744-6.732Z"
      fill="url(#a)"
    />
    <path
      d="M232.542 136.912 162.174 15.046c-7.356-13.018-24.101-17.804-37.265-10.52-4.549 2.393-8.227 6.117-10.647 10.434L43.41 137.773c-5.71 13.775 1.065 29.665 15.1 35.312 2.807 1.053 5.807 1.733 8.808 1.915H209.02c7.26-.383 13.938-3.542 18.875-8.893 4.936-5.37 7.453-12.348 7.066-19.527-.194-3.073-.872-6.031-2.42-9.668Z"
      fill="#6259FF"
      fillOpacity={0.65}
    />
    <path
      d="M42.977 137.523a.518.518 0 0 0-.028.059c-5.82 14.037 1.087 30.218 15.374 35.967l.011.005c2.85 1.068 5.9 1.76 8.954 1.945l.03.001h141.703l.027-.001c7.39-.39 14.191-3.607 19.215-9.053h.001c5.026-5.468 7.591-12.578 7.197-19.893v-.005c-.198-3.134-.89-6.148-2.459-9.832l-.46.196.433-.25L162.609 14.8l-.001-.002c-7.49-13.253-24.533-18.125-37.936-10.712-4.636 2.44-8.381 6.233-10.845 10.627l-.001.003-70.849 122.807Z"
      stroke="url(#b)"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M138.173 103.794c4.646 0 8.421-3.84 8.421-8.434V68.28c0-4.604-3.775-8.328-8.421-8.328-4.646 0-8.518 3.724-8.518 8.328v27.08c0 4.595 3.872 8.434 8.518 8.434Zm-8.518 24.309c0 4.585 3.872 8.424 8.518 8.424 4.646 0 8.421-3.839 8.421-8.529 0-4.585-3.775-8.328-8.421-8.328-4.646 0-8.518 3.829-8.518 8.433Z"
      fill="url(#c)"
    />
    <defs>
      <linearGradient
        id="a"
        x1={110.5}
        y1={59}
        x2={-29.057}
        y2={186.021}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#906CFF" />
        <stop offset={0} stopColor="#6259FF" />
        <stop offset={1} stopColor="#4E47CC" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={72.205}
        y1={21.373}
        x2={180.053}
        y2={170.104}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" stopOpacity={0.25} />
        <stop offset={1} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="c"
        x1={138.126}
        y1={64.272}
        x2={122.575}
        y2={62.828}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" stopOpacity={0.75} />
        <stop offset={1} stopColor="#fff" stopOpacity={0.2} />
      </linearGradient>
    </defs>
  </svg>
);
