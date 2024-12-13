import { GraphQLClient } from "graphql-request";
import {
  IEscrowData,
  IGetPaymentListResponse,
  IPage,
  TPaymentListQueryParams,
} from "../../typing";
import { parseEscrowData } from "./parseEscrowData";
import { buildQuery } from "./queryBuilder";

export const getPaymentList = async (
  client: GraphQLClient,
  query: TPaymentListQueryParams,
  pagination?: IPage,
): Promise<IGetPaymentListResponse> => {
  const queryString = buildQuery({ query, pagination });

  const response: any = await client.request(queryString);

  const { escrow_status_aggregate, escrow_status_view } = response;

  const { totalCount } = escrow_status_aggregate.aggregate;

  const data: IEscrowData[] = escrow_status_view.map(parseEscrowData);
  return {
    totalCount,
    data,
  };
};
