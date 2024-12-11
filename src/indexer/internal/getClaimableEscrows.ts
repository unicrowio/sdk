import { GraphQLClient } from "graphql-request";
import { buildClaimableQuery } from "../internal/queryClaimableEscrows";

export const getClaimableEscrows = async (
  client: GraphQLClient,
  walletUserAddress: string,
  chainId: number,
): Promise<string[]> => {
  // Convert chainId from number to string
  const chainIdString = chainId.toString();

  const response: any = await client.request(buildClaimableQuery, {
    walletUserAddress,
    chainId: chainIdString,
  });

  const { ready_for_claim } = response;

  return ready_for_claim.map(({ escrow_id }: any) => escrow_id);
};
