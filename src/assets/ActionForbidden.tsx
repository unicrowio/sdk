import React, { SVGProps } from "react";

export const ActionForbidden = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={236}
    height={176}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="a"
      style={{
        maskType: "alpha",
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={236}
      height={176}
    >
      <path fill="#C4C4C4" d="M0 0h236v176H0z" />
    </mask>
    <g mask="url(#a)">
      <path
        d="M141.713 99.811 64.816 22.883c-8.095-8.25-21.534-8.49-29.883-.435-2.91 2.69-4.904 6.2-5.841 9.903L.934 138.082c-1.492 11.414 6.746 21.922 18.34 23.343 2.302.228 4.675.138 6.948-.324l105.606-28.192c5.333-1.73 9.677-5.415 12.282-10.39 2.601-4.989 3.076-10.696 1.347-15.976-.761-2.254-1.86-4.326-3.744-6.732Z"
        fill="url(#b)"
      />
      <g filter="url(#c)">
        <path
          d="M111.809 106.434 67.721 62.329c-4.64-4.73-12.346-4.867-17.132-.25-1.669 1.543-2.812 3.556-3.35 5.678l-16.143 60.619c-.855 6.544 3.868 12.568 10.515 13.383 1.32.13 2.68.079 3.983-.186l60.547-16.163a12.12 12.12 0 0 0 7.041-5.957c1.492-2.86 1.764-6.132.773-9.159-.436-1.292-1.066-2.48-2.146-3.86Z"
          fill="#6259FF"
        />
        <path
          d="M111.809 106.434 67.721 62.329c-4.64-4.73-12.346-4.867-17.132-.25-1.669 1.543-2.812 3.556-3.35 5.678l-16.143 60.619c-.855 6.544 3.868 12.568 10.515 13.383 1.32.13 2.68.079 3.983-.186l60.547-16.163a12.12 12.12 0 0 0 7.041-5.957c1.492-2.86 1.764-6.132.773-9.159-.436-1.292-1.066-2.48-2.146-3.86Z"
          fill="#000"
          fillOpacity={0.2}
        />
      </g>
      <g filter="url(#d)">
        <path
          d="M232.542 136.912 162.174 15.046c-7.356-13.018-24.101-17.804-37.265-10.52-4.549 2.394-8.227 6.117-10.647 10.434L43.41 137.773c-5.71 13.775 1.065 29.665 15.1 35.312 2.807 1.053 5.807 1.733 8.808 1.915H209.02c7.26-.383 13.938-3.542 18.875-8.893 4.936-5.37 7.453-12.348 7.066-19.527-.194-3.073-.872-6.031-2.42-9.668Z"
          fill="#6259FF"
          fillOpacity={0.35}
        />
        <path
          d="M42.977 137.523a.518.518 0 0 0-.029.059c-5.82 14.037 1.088 30.218 15.375 35.967h0l.011.005c2.85 1.068 5.899 1.76 8.954 1.945l.03.001H209.02l.027-.001c7.39-.39 14.191-3.607 19.215-9.053h.001c5.026-5.468 7.591-12.578 7.197-19.893v-.005c-.198-3.134-.89-6.148-2.459-9.832l-.46.196.433-.25L162.609 14.8l-.001-.002c-7.49-13.253-24.533-18.125-37.936-10.712-4.636 2.44-8.381 6.233-10.845 10.627l-.001.003-70.849 122.807Z"
          stroke="url(#e)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g filter="url(#f)">
        <mask id="i" fill="#fff">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M138.173 103.794c4.646 0 8.421-3.839 8.421-8.433V68.28c0-4.605-3.775-8.328-8.421-8.328-4.646 0-8.518 3.723-8.518 8.328v27.08c0 4.594 3.872 8.433 8.518 8.433Zm-8.518 24.309c0 4.585 3.872 8.424 8.518 8.424 4.646 0 8.421-3.839 8.421-8.529 0-4.585-3.775-8.328-8.421-8.328-4.646 0-8.518 3.829-8.518 8.433Z"
          />
        </mask>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M138.173 103.794c4.646 0 8.421-3.839 8.421-8.433V68.28c0-4.605-3.775-8.328-8.421-8.328-4.646 0-8.518 3.723-8.518 8.328v27.08c0 4.594 3.872 8.433 8.518 8.433Zm-8.518 24.309c0 4.585 3.872 8.424 8.518 8.424 4.646 0 8.421-3.839 8.421-8.529 0-4.585-3.775-8.328-8.421-8.328-4.646 0-8.518 3.829-8.518 8.433Z"
          fill="url(#g)"
        />
        <path
          d="M146.194 95.36c0 4.377-3.598 8.034-8.021 8.034v.8c4.869 0 8.821-4.02 8.821-8.833h-.8Zm0-27.08v27.08h.8V68.28h-.8Zm-8.021-7.927c4.43 0 8.021 3.549 8.021 7.928h.8c0-4.83-3.959-8.728-8.821-8.728v.8Zm-8.118 7.928c0-4.374 3.682-7.928 8.118-7.928v-.8c-4.856 0-8.918 3.892-8.918 8.728h.8Zm0 27.08V68.28h-.8v27.08h.8Zm8.118 8.033c-4.429 0-8.118-3.663-8.118-8.033h-.8c0 4.819 4.055 8.833 8.918 8.833v-.8Zm0 32.733c-4.429 0-8.118-3.664-8.118-8.024h-.8c0 4.81 4.055 8.824 8.918 8.824v-.8Zm8.021-8.129c0 4.475-3.601 8.129-8.021 8.129v.8c4.872 0 8.821-4.023 8.821-8.929h-.8Zm-8.021-7.928c4.429 0 8.021 3.568 8.021 7.928h.8c0-4.81-3.958-8.728-8.821-8.728v.8Zm-8.118 8.033c0-4.379 3.689-8.033 8.118-8.033v-.8c-4.863 0-8.918 4.004-8.918 8.833h.8Z"
          fill="url(#h)"
          mask="url(#i)"
        />
      </g>
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={74.56}
        y1={87.984}
        x2={-29.058}
        y2={186.021}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#906CFF" />
        <stop offset={0} stopColor="#6259FF" />
        <stop offset={1} stopColor="#4E47CC" />
      </linearGradient>
      <linearGradient
        id="e"
        x1={72.204}
        y1={21.373}
        x2={180.053}
        y2={170.104}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" stopOpacity={0.25} />
        <stop offset={1} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="g"
        x1={138.126}
        y1={64.272}
        x2={122.575}
        y2={62.829}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" stopOpacity={0.75} />
        <stop offset={1} stopColor="#fff" stopOpacity={0.2} />
      </linearGradient>
      <linearGradient
        id="h"
        x1={132.352}
        y1={68.874}
        x2={157.819}
        y2={75.851}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" stopOpacity={0.25} />
        <stop offset={1} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <filter
        id="c"
        x={11.996}
        y={39.698}
        width={121.545}
        height={121.13}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur
          stdDeviation={9.5}
          result="effect1_foregroundBlur_5872_58990"
        />
      </filter>
      <filter
        id="d"
        x={16.383}
        y={-23.885}
        width={243.617}
        height={223.885}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImage" stdDeviation={12} />
        <feComposite
          in2="SourceAlpha"
          operator="in"
          result="effect1_backgroundBlur_5872_58990"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_backgroundBlur_5872_58990"
          result="shape"
        />
      </filter>
      <filter
        id="f"
        x={114.655}
        y={44.953}
        width={46.938}
        height={106.574}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImage" stdDeviation={7.5} />
        <feComposite
          in2="SourceAlpha"
          operator="in"
          result="effect1_backgroundBlur_5872_58990"
        />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dx={5} dy={5} />
        <feGaussianBlur stdDeviation={5} />
        <feColorMatrix values="0 0 0 0 0.564706 0 0 0 0 0.423529 0 0 0 0 1 0 0 0 1 0" />
        <feBlend
          in2="effect1_backgroundBlur_5872_58990"
          result="effect2_dropShadow_5872_58990"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect2_dropShadow_5872_58990"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
