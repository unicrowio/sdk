import { gql } from 'graphql-request'

export const buildClaimableQuery = gql`
  query getClaimableEscrows($walletUserAddress: String!) {
    ready_for_claim: escrow_status_view(
      where: {
        _or: [
          { seller: { _ilike: $walletUserAddress } }
          { buyer: { _ilike: $walletUserAddress } }
        ]
        _and: {
          claimed: { _eq: false }
          status: { _in: ["PERIOD_EXPIRED", "RELEASED", "SETTLED"] }
        }
      }
    ) {
      escrow_id
    }
  }
`
