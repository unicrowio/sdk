import { GraphQLClient } from "graphql-request";
import { buildQuery, IQuery } from "./queryBuilder";
import { parseEscrowData } from "./parseEscrowData";
import { IEscrowData } from "../../typing";
import { returningValues } from "./payload";

type TEscrowId = Pick<IQuery, "escrowId" | "chainId">;

export const getSinglePayment = async (
  client: GraphQLClient,
  escrowId: number,
  chainId: number,
): Promise<IEscrowData | null> => {
  const query: TEscrowId = {};

  query.escrowId = escrowId;
  query.chainId = chainId;

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
