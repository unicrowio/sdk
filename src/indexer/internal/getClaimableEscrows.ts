import { GraphQLClient } from "graphql-request";
import { buildClaimableQuery } from "../internal/queryClaimableEscrows";

export const getClaimableEscrows = async (
  client: GraphQLClient,
  walletUserAddress: string,
  chainId: bigint,
): Promise<string[]> => {
  const response: any = await client.request(buildClaimableQuery, {
    walletUserAddress,
    chainId: chainId.toString(),
  });

  const { ready_for_claim } = response;

  return ready_for_claim.map(({ escrow_id }: any) => escrow_id);
};
