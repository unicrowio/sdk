import { GraphQLClient } from "graphql-request";
import { buildQuery, IQuery } from "./queryBuilder";
import { parseEscrowData } from "./parseEscrowData";
import { IEscrowData } from "../../typing";
import { returningValues } from "./payload";

type TEscrowId = Pick<IQuery, "escrow_id">;

export const getSinglePayment = async (
  client: GraphQLClient,
  escrowId: number,
): Promise<IEscrowData | null> => {
  const query: TEscrowId = {};

  query.escrow_id = escrowId;

  const queryString = buildQuery({
    query,
    returningValues: [...returningValues, "status"],
  });

  const response = await client.request(queryString);
  const { escrow_status_view } = response;

  if (escrow_status_view?.length > 0) {
    const data: IEscrowData = parseEscrowData(escrow_status_view[0]);
    return data;
  }

  return null;
};
