import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import styled from "styled-components";

const SkeletonWrapper = styled.div`
  display: flex;
  gap: 24px;
  flex-direction: column;
  width: 100%;

  .token {
    margin-top: -24px;
  }

  .subtitle {
    margin-top: -40px;
  }
`;

export const ModalBodySkeleton = () => {
  return (
    <SkeletonWrapper>
      <Skeleton width="60%" className="token" height={80} />
      <Skeleton width="40%" className="subtitle" height={60} />
      <Skeleton width="100%" height={24} />
      <Skeleton width="100%" height={24} />
      <Skeleton width="100%" height={24} />
      <Skeleton width="100%" height={24} />
    </SkeletonWrapper>
  );
};
