import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import styled from "styled-components";

const SkeletonWrapper = styled.div`
  display: flex;
  gap: 24px;
  flex-direction: column;
  width: 100%;

  .MuiSkeleton-root {
    transform: none;
    &.token {
      margin: 4px 0 5px 0;
    }
  
    &.subtitle {
      margin-bottom: 14px;
    }
  
    &.lines {
      margin: 2px 0 9px 0;
    }

    &.buttons {
      margin-top: 12px;
    }
  }
`;

export const ModalBodySkeleton = () => {
  return (
    <SkeletonWrapper>
      <Skeleton width="60%" className="token" height={35} />
      <Skeleton width="40%" className="subtitle" height={22} />
      <Skeleton width="100%" className="lines" height={20} />
      <Skeleton width="100%" className="lines" height={20} />
      <Skeleton width="100%" className="buttons" height={48} />
    </SkeletonWrapper>
  );
};
