import styled, { css } from "styled-components";

interface IStack {
	direction?: "column" | "row";
	gap?: number;
}

export const Stack = styled.div<IStack>`
  display: flex;
  width: 100%;
  flex-direction: ${(props) => (props.direction === "row" ? "row" : "column")};

  & > :not(:first-child) {
    ${(props) => {
			const gap = props.gap ? props.gap : 8;
			if (props.direction === "row") {
				return css`
          margin-left: ${gap}px;
        `;
			} else {
				return css`
          margin-top: ${gap}px;
        `;
			}
		}};
  }
`;
