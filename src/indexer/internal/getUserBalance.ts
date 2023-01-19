import {
  calculateSplit,
  groupBy,
  displayableAmount,
  displayableAmountBN,
} from "../../helpers";
import { GraphQLClient } from "graphql-request";
import { getTokenInfo } from "../../core";
import {
  EscrowStatusView,
  GetResponseUserBalance,
  IToken,
  IBalance,
} from "../../typing";
import { buildBalanceQuery } from "./queryBalance";
import BigNumber from "bignumber.js";
import { parseEscrowData } from "./parseEscrowData";

const addTokenInfo = async (balances: IBalance[]) => {
  const tokens: IToken[] = [];
  for (const balance of balances) {
    const tokenInfo = await getTokenInfo(balance.token.address);
    tokens.push(tokenInfo);
  }
  return tokens;
};

const prepareResponseData = (balance: any, tokens: IToken[]) => {
  const _amount = new BigNumber(balance.amount);
  const tokenInfo = tokens.find((t) => t.address === balance.token.address);

  return {
    ...balance,
    token: { ...tokenInfo },
    total: _amount,
    displayableAmount: displayableAmount(_amount, tokenInfo.decimals),
    amountBN: displayableAmountBN(_amount, tokenInfo.decimals),
  };
};

/*
  Get balance from logged user
*/
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
  const parsedPending = pending.map(parseEscrowData);
  const parsedReady = ready_for_claim.map(parseEscrowData);

  const groupPendingByToken = groupBy(
    parsedPending,
    (item) => item.token.address,
  );
  const groupReadyByToken = groupBy(parsedReady, (item) => item.token.address);

  const pendingData: IBalance[] = Object.keys(groupPendingByToken)
    .map((key) => {
      const group = groupPendingByToken[key];
      const total = calculateSplit(group, walletUserAddress);
      return {
        token: {
          address: key,
        },
        status: "Pending",
        amount: total.toString(),
      };
    })
    .filter((item: any) => new BigNumber(item.amount).gt(0)) as IBalance[];

  const readyData: IBalance[] = Object.keys(groupReadyByToken)
    .map((key) => {
      const group = groupReadyByToken[key];
      const total = calculateSplit(group, walletUserAddress);
      return {
        token: {
          address: key,
        },
        status: "Ready to claim",
        amount: total.toString(),
      };
    })
    .filter((item: any) => new BigNumber(item.amount).gt(0)) as IBalance[];

  const tokens = await addTokenInfo([...pendingData, ...readyData]);

  return {
    pending: pendingData.map((balance) => prepareResponseData(balance, tokens)),
    readyForClaim: readyData.map((balance) =>
      prepareResponseData(balance, tokens),
    ),
  };
};
