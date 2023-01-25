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

const fetchTokenInfo = async (balances: IBalance[]) => {
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

const mapData = (
  _group,
  status: "Pending" | "Ready to claim",
  walletUserAddress: string,
) =>
  Object.keys(_group)
    .map((key) => {
      const total = calculateSplit(_group[key], walletUserAddress);
      return {
        token: {
          address: key,
        },
        status,
        amount: total.toString(),
      };
    })
    .filter((item: any) => new BigNumber(item.amount).gt(0)) as IBalance[];

/**
 * Read how much balance does the provided account have in the contract
 * 
 * @param client - Index client instance
 * @param walletUserAddress Address of an account to return the balance of
 * @returns Map of balances broken down by claimability and tokens
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
  const parsedPendingData = pending.map(parseEscrowData);
  const parsedReadyData = ready_for_claim.map(parseEscrowData);

  const groupPendingTokens = groupBy(
    parsedPendingData,
    (item) => item.token.address,
  );
  const groupReadyTokens = groupBy(
    parsedReadyData,
    (item) => item.token.address,
  );

  const pendingData: IBalance[] = mapData(
    groupPendingTokens,
    "Pending",
    walletUserAddress,
  );
  const readyData: IBalance[] = mapData(
    groupReadyTokens,
    "Ready to claim",
    walletUserAddress,
  );

  const tokens = await fetchTokenInfo([...pendingData, ...readyData]);

  return {
    pending: pendingData.map((balance) => prepareResponseData(balance, tokens)),
    readyForClaim: readyData.map((balance) =>
      prepareResponseData(balance, tokens),
    ),
  };
};
