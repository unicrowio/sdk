import {
  calculateSplit,
  groupBy,
  displayableAmount,
  displayableAmountBI,
} from "../../helpers";
import { GraphQLClient } from "graphql-request";
import { getTokenInfo } from "../../core";
import {
  GetResponseUserBalance,
  IToken,
  IBalance,
  IEscrowStatus,
  EscrowStatus,
} from "../../typing";
import { buildBalanceQuery } from "./queryBalance";
import { parseEscrowData } from "./parseEscrowData";
import { EscrowStatusView } from "indexer/internal/types";

const fetchTokenInfo = async (balances: IBalance[]) => {
  const tokens: IToken[] = [];
  for (const balance of balances) {
    const tokenInfo = await getTokenInfo(balance.token.address);
    tokens.push(tokenInfo);
  }
  return tokens;
};

const prepareResponseData = (balance: any, tokens: IToken[]) => {
  const _amount = BigInt(balance.amount);
  const tokenInfo = tokens.find((t) => t.address === balance.token.address);

  return {
    ...balance,
    token: { ...tokenInfo },
    total: _amount,
    displayableAmount: displayableAmount(_amount, tokenInfo.decimals),
    amountBI: displayableAmountBI(_amount, tokenInfo.decimals),
  };
};

const mapData = (_group, walletUserAddress: string) =>
  Object.keys(_group)
    .map((key) => {
      const total = calculateSplit(_group[key], walletUserAddress);
      return {
        amount: total.toString(),
        token: {
          address: key,
        },
        status: _group[key].status,
      };
    })
    .filter((item: any) => BigInt(item.amount) > 0) as IBalance[];

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
    walletUserAddress,
  );
  const readyData: IBalance[] = mapData(groupReadyTokens, walletUserAddress);

  const tokens = await fetchTokenInfo([...pendingData, ...readyData]);

  return {
    pending: pendingData.map((balance) => prepareResponseData(balance, tokens)),
    readyForClaim: readyData.map((balance) =>
      prepareResponseData(balance, tokens),
    ),
  };
};
