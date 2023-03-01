import * as React from "react";
import { SVGProps } from "react";
import styled from "styled-components";

export const Loading = (props: SVGProps<SVGSVGElement>) => (
  <AnimatedLogo>
    <svg
      width={44}
      height={49}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m19.976 36.748.524-16.035-12.506-3.877s4.708-2.998 12.704-2.157l.33-10.063L.671 0l7.217 11.094-3.82-1.541.351.962s-.059 5.998-.22 13.909l5.528 7.372-5.624-2.982c-.032 1.356-.067 2.741-.104 4.14-.316 11.695 18.814 12.748 18.814 12.748s-3.048-2.317-2.838-8.954Z"
        fill="#252E47"
        className="long-path"
      />
      <path
        d="M43.413 10.095 25.641 5.723s2.532 3.108 2.322 6.69l-2.322 36.24s.535-1.475 6.105-2.423c8.514-1.053 9.565-8.428 9.565-8.428l1.162-15.31-6.908 4.143 7.201-8.014.647-8.526Z"
        fill="#322CA2"
        className="short-path"
      />
      <path
        d="M23.563 20.104a1.782 1.782 0 0 0-.817-3.469 1.782 1.782 0 0 0 .817 3.47Z"
        fill="#889AC4"
        className="shortest-path"
      />
    </svg>
  </AnimatedLogo>
);

export const AnimatedLogo = styled.div`
  margin: 0 auto;
  text-align: center;

  svg path {
    stroke-width: 1px;
    transition: all 0.3s ease-in-out;

    &[class*="long-path"] {
      animation: dash-long 2s linear infinite;
      stroke: #252e47;
      stroke-dasharray: 160;
      stroke-dashoffset: 160;
    }

    &[class*="short-path"] {
      animation: dash-short 2s linear infinite;
      stroke: #322ca2;
      stroke-dasharray: 125;
      stroke-dashoffset: 125;
    }

    &[class*="shortest-path"] {
      animation: dash-shortest 4s linear infinite;
      stroke: #889AC4;
      stroke-dasharray: 11;
      stroke-dashoffset: 11;
    }
  }

  @keyframes dash-long {
    0% {
      stroke-dashoffset: 160;
      stroke: #252e47;
      fill: transparent;
    }
    20% {
      stroke-dashoffset: 127;
      stroke: #252e47;
      fill: transparent;
    }
    80% {
      stroke-dashoffset: 0;
      stroke: #252e47;
      fill: #d4d5da;
    }
    100% {
      stroke-dashoffset: 0;
      stroke: transparent;
      fill: #252e47;
    }
  }

  @keyframes dash-short {
    0% {
      stroke-dashoffset: 125;
      stroke: #322ca2;
      fill: transparent;
    }
    20% {
      stroke-dashoffset: 99;
      stroke: #322ca2;
      fill: transparent;
    }
    80% {
      stroke-dashoffset: 0;
      stroke: #322ca2;
      fill: #d4d5da;
    }
    100% {
      stroke-dashoffset: 0;
      stroke: transparent;
      fill: #322ca2;
    }
  }

  @keyframes dash-shortest {
    0% {
      stroke-dashoffset: 124;
      stroke: #4777e9;
      fill: transparent;
    }
    20% {
      stroke-dashoffset: 99;
      stroke: #4777e9;
      fill: transparent;
    }
    80% {
      stroke-dashoffset: 0;
      stroke: #4777e9;
      fill: #d4d5da;
    }
    100% {
      stroke-dashoffset: 0;
      stroke: transparent;
      fill: #889AC4;
    }
  }
`;
