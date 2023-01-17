import { gql } from "graphql-request";
import { IPage } from "../../typing";
import { returningValues as genericValues } from "./payload";

export interface IQuery {
  escrow_id?: number;
  seller?: string;
  buyer?: string;
  marketplace?: string;
  claimed?: boolean;
  dateStart?: Date;
  dateEnd?: Date;
}

interface IBuildQuery {
  query: IQuery;
  returningValues?: string[];
  pagination?: IPage;
}

const buildQuery = ({
  query,
  returningValues = genericValues,
  pagination,
}: IBuildQuery) => {
  let whereSentence: string | null = null;
  let aggregate = "";
  const conditions: string[] = [];
  const sentences: string[] = [];

  if (query.escrow_id) {
    conditions.push(`{ escrow_id: { _eq: "${query.escrow_id}"} }`);
  }

  if (query.seller && query.buyer) {
    conditions.push(
      `{_or: [{ seller: { _ilike: "${query.seller}"}}, { buyer: { _ilike: "${query.buyer}"}} ]}`,
    );
  } else if (query.buyer) {
    conditions.push(`{ buyer: { _ilike: "${query.buyer}"} }`);
  } else if (query.seller) {
    conditions.push(`{ seller: { _ilike: "${query.seller}"} }`);
  }

  if (query.marketplace) {
    conditions.push(`{ marketplace: {_ilike: "${query.marketplace}"} }`);
  }

  if (query.claimed !== undefined) {
    conditions.push(`{ claimed: {_eq: ${query.claimed}} }`);
  }

  if (query.dateStart) {
    conditions.push(`{ paid_at: { _gte: "${query.dateStart.toISOString()}"} }`);
  }

  if (query.dateEnd) {
    conditions.push(`{ paid_at: { _lte: "${query.dateEnd.toISOString()}"} }`);
  }

  if (conditions.length > 0) {
    whereSentence = `where: {_and: [ ${conditions.join("\n")} ]}`;
    sentences.push(whereSentence);
  }

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    sentences.push(`limit: ${pagination.limit}, offset: ${offset}`);
    const allOrWhere = whereSentence ? `(${whereSentence})` : " ";
    aggregate = `
        escrow_status_aggregate${allOrWhere}{
            aggregate {
              totalCount: count
            }
          }
    `;
  } else {
    sentences.push("limit: 20, offset: 0");
  }

  // TODO: Make me customizable
  sentences.push("order_by: { paid_at: desc } ");

  return gql`
    query getPaymentFromEscrowStatusView {
      ${aggregate}

      escrow_status_view(
        ${sentences.join(",\n")}
        )
      {
        ${returningValues.join("\n\t\t")}
      }
    }
  `;
};

export { buildQuery };
