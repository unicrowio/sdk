import { gql } from "graphql-request";

export const buildClaimableQuery = gql`
  query getClaimableEscrows($walletUserAddress: String!, $network: String) {
    ready_for_claim: escrow_status_view(
      where: {
        _or: [
          { seller: { _ilike: $walletUserAddress } _and: {split_seller: { _gt: 0}} }
          { buyer: { _ilike: $walletUserAddress } _and: {split_buyer: { _gt: 0}} }

        ]
        _and: {
          claimed: { _eq: false }
          status: { _eq: "PERIOD_EXPIRED" }
          { _or: [{ network: { _eq: $network } }, { network: { _is_null: true } }] }
        }
      }
    ) {
      escrow_id
    }
  }
`;
