import React, { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div``;

const Text = styled.span`
  font-family: 'Bai Jamjuree';
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 24px;

  color: #252e47;
`;

export type TSubtitleProps = {
	children: ReactNode;
};

export const Subtitle = (props: TSubtitleProps) => {
	return (
		<Container>
			<Text>{props.children}</Text>
		</Container>
	);
};
