import { getPaymentList } from "./internal/getPaymentList";
import { GraphQLClient } from "graphql-request";
import { IndexerInstance, IPage, TPaymentListQueryParams } from "../typing";
import { getSinglePayment } from "./internal/getSinglePayment";
import { getUserBalance } from "./internal/getUserBalance";
import { getClaimableEscrows } from "./internal/getClaimableEscrows";

/**
 * Connects to the indexer and returnes an instance of the object with functions used to read data from the indexer
 *
 * @param url - Url of the indexer
 */
export const getInstance = (url: string): IndexerInstance => {
  const client = new GraphQLClient(url);

  return {
    getPaymentList: (
      queryParams: TPaymentListQueryParams,
      pagination: IPage,
    ) => {
      return getPaymentList(client, queryParams, pagination);
    },
    getSinglePayment: (escrowId: number) => {
      return getSinglePayment(client, escrowId);
    },
    getUserBalance: (walletUserAddress: string) => {
      return getUserBalance(client, walletUserAddress);
    },
    getClaimableEscrows: (walletUserAddress: string) => {
      return getClaimableEscrows(client, walletUserAddress);
    },
  };
};
