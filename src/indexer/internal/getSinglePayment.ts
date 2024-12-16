import { GraphQLClient } from "graphql-request";
import { buildQuery } from "./queryBuilder";
import { parseEscrowData } from "./parseEscrowData";
import { IEscrowData, TPaymentListQueryParams } from "../../typing";
import { returningValues } from "./payload";

type TEscrowId = Pick<TPaymentListQueryParams, "escrowId" | "chainId">;

export const getSinglePayment = async (
  client: GraphQLClient,
  escrowId: number,
  chainId: bigint,
): Promise<IEscrowData | null> => {
  const query: TEscrowId = {
    escrowId,
    chainId,
  };

  const queryString = buildQuery({
    query,
    returningValues: [...returningValues, "status"],
  });

  const response: any = await client.request(queryString);
  const { escrow_status_view } = response;

  if (escrow_status_view?.length > 0) {
    const data: IEscrowData = parseEscrowData(escrow_status_view[0]);
    return data;
  }

  return null;
};
