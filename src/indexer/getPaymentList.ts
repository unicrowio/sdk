import { GraphQLClient } from "graphql-request";
import {
  IEscrowData,
  IGetPaymentListResponse,
  IPage,
  TPaymentListQueryParams,
} from "../typing";
import { parseEscrowData } from "./parseEscrowData";
import { buildQuery } from "./queryBuilder";


/**
 * List of the Payments from Indexer.
 *
 * @param client: GraphQLClient
 * @param query: TPaymentListQueryParams
 * @param pagination?: IPage - if not provided, return the first 20 records by default
 * 
 * @returns {Promise<IGetPaymentListResponse>}
 */
export const getPaymentList = async (
  client: GraphQLClient,
  query: TPaymentListQueryParams,
  pagination?: IPage,
): Promise<IGetPaymentListResponse> => {
  const queryString = buildQuery({ query, pagination });

  const response = await client.request(queryString);

  const { escrow_status_aggregate, escrow_status_view } = response;

  const { totalCount } = escrow_status_aggregate.aggregate;

  const data: IEscrowData[] = escrow_status_view.map(parseEscrowData);
  return {
    totalCount,
    data,
  };
};
