import { GraphQLClient } from "graphql-request";
import { buildClaimableQuery } from "../internal/queryClaimableEscrows";

export const getClaimableEscrows = async (
  client: GraphQLClient,
  walletUserAddress: string,
): Promise<string[]> => {
  const response: any = await client.request(buildClaimableQuery, {
    walletUserAddress,
    chainId: globalThis?.unicrow?.network?.chainId,
  });

  const { ready_for_claim } = response;

  return ready_for_claim.map(({ escrow_id }: any) => escrow_id);
};
