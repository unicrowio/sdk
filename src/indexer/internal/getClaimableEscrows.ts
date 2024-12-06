import { GraphQLClient } from "graphql-request";
import { buildClaimableQuery } from "../internal/queryClaimableEscrows";

export const getClaimableEscrows = async (
  client: GraphQLClient,
  walletUserAddress: string,
): Promise<string[]> => {
  const response: any = await client.request(buildClaimableQuery, {
    walletUserAddress,
    network: globalThis?.unicrow?.network?.chainName,
  });

  const { ready_for_claim } = response;

  return ready_for_claim.map(({ escrow_id }: any) => escrow_id);
};
