import { GraphQLClient } from "graphql-request";
import { buildClaimableQuery } from "../internal/queryClaimableEscrows";

export const getClaimableEscrows = async (
  client: GraphQLClient,
  walletUserAddress: string,
): Promise<string[]> => {
  const response = await client.request(buildClaimableQuery, {
    walletUserAddress,
  });

  const { ready_for_claim } = response;

  return ready_for_claim.map(({ escrow_id }: any) => escrow_id);
};
