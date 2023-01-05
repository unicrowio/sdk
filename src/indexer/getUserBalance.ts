import {
  calculateSplit,
  groupBy,
  displayableAmount,
  displayableAmountBN,
} from "../helpers";
import { GraphQLClient } from "graphql-request";
import { getTokenInfo } from "../core";
import {
  EscrowStatusView,
  GetResponseUserBalance,
  IToken,
  IBalance,
} from "../typing";
import { buildBalanceQuery } from "./queryBalance";
import BigNumber from "bignumber.js";

export const getUserBalance = async (
  client: GraphQLClient,
  walletUserAddress: string,
): Promise<GetResponseUserBalance> => {
  const queryString = buildBalanceQuery(walletUserAddress);

  const response = await client.request<{
    pending: EscrowStatusView[];
    ready_for_claim: EscrowStatusView[];
  }>(queryString);

  const { pending, ready_for_claim } = response;

  const groupByPending = groupBy(pending, (item) => item.currency);
  const groupByReady = groupBy(ready_for_claim, (item) => item.currency);

  const pendingData: IBalance[] = Object.keys(groupByPending)
    .map((key) => {
      const group = groupByPending[key];
      const total = calculateSplit(group, walletUserAddress);
      return {
        tokenSymbol: key,
        status: "Pending",
        amount: total.toString(),
      };
    })
    .filter((item: any) => new BigNumber(item.amount).gt(0)) as IBalance[];

  const readyData: IBalance[] = Object.keys(groupByReady)
    .map((key) => {
      const group = groupByReady[key];
      const total = calculateSplit(group, walletUserAddress);
      return {
        tokenSymbol: key,
        status: "Ready to claim",
        amount: total.toString(),
      };
    })
    .filter((item: any) => new BigNumber(item.amount).gt(0)) as IBalance[];

  const tokensAddress = [];
  for await (const balance of [...pendingData, ...readyData]) {
    const tokenInfo = await getTokenInfo(balance.tokenSymbol);
    tokensAddress.push(tokenInfo);
  }

  const uniqueTokensAddress = new Set(tokensAddress);

  const tokensInfo = await Promise.all(Array.from(uniqueTokensAddress));

  const resolve = (item: any) => {
    const _amount = new BigNumber(item.amount).div(100);
    const tokenInfo = tokensInfo.find(
      (t) => t.tokenAddress === item.tokenSymbol,
    ) as IToken;
    return {
      ...item,
      total: _amount,
      displayableAmount: displayableAmount(_amount, tokenInfo.decimals),
      amountBN: displayableAmountBN(_amount, tokenInfo.decimals),
      ...tokenInfo,
    };
  };

  const p = pendingData.map((item) => resolve(item));
  const r = readyData.map((item) => resolve(item));

  return {
    pending: p,
    readyForClaim: r,
  };
};
