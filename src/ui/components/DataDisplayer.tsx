import styled from "styled-components";
import React, { ReactNode } from "react";
import { CopyToClipboard } from "./Copy";
import { Marker } from "./Marker";

const DataDisplayerWrapper = styled.div`
  height: 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9eaed;
  &:last-child {
    border-bottom: none;
  }
`;

const DataDisplayerLabel = styled.div`
  flex-grow: 1;

  margin-right: 2rem;

  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;

  color: #252e47;
`;

const DataDisplayerValue = styled.div`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  color: #252e47;
`;

export const ContainerDataDisplayer = styled.div`
  flex: 1;
`;

interface Props {
  label: string;
  value: ReactNode;
  copy?: string | null;
  marker?: string;
}

export const DataDisplayer = ({ label, value, copy, marker }: Props) => {
  return (
    <DataDisplayerWrapper>
      <DataDisplayerLabel>
        <>
          {label}
          {!!marker && <Marker style={{ marginLeft: "6px" }} text={marker} />}
        </>
      </DataDisplayerLabel>
      {copy ? (
        <DataDisplayerValue>
          <CopyToClipboard content={value} copy={copy} />
        </DataDisplayerValue>
      ) : (
        <DataDisplayerValue>{value}</DataDisplayerValue>
      )}
    </DataDisplayerWrapper>
  );
};
