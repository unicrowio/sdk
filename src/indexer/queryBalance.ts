import { gql } from "graphql-request";
import { returningValues } from "./payload";

export const buildBalanceQuery = (address: string) => {
  const where = (op: "_nin" | "_in") => `
    where: {
          _or: [
            {
              seller: { _ilike: "${address}" } }
            {
              buyer: { _ilike: "${address}" }
            }
          ]
           _and:
              {
                claimed: { _eq: false }
                status: { ${op}: ["PERIOD_EXPIRED", "RELEASED", "SETTLED"] }
              }
        }
  `;

  const query = gql`
    query getBalance {
      pending: escrow_status_view(${where("_nin")}) {
        ${returningValues.join("\n\t\t")}
      }
      ready_for_claim: escrow_status_view(${where("_in")}) {
        ${returningValues.join("\n\t\t")}
      }
    }
  `;

  return query;
};
