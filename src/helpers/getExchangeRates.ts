export const STABLE_COINS = ["DAI", "USDC", "USDT"];

export interface IResult {
  [key: string]: number | undefined;
}

interface IGeckoRespObj {
  [key: string]: { usd: number | undefined };
}

// ChainId-CoinGeckoNetworkId mapping
const CG_NETWORK_ID = {
  42161: "arbitrum-one",
  5: "ethereum", // Goerli
  5777: "ethereum", // Unicrow Testnet
};

const API_COINGECKO =
  "https://api.coingecko.com/api/v3/simple/price?vs_currencies=USD&ids=";
const API_COINGECKO_TOKENS =
  "https://api.coingecko.com/api/v3/simple/token_price/";

const getCoinGeckoPrices = async (
  network: string,
  tokensAddresses: string[],
): Promise<IResult | void> => {
  let response = {} as IResult;

  // ETH needs a different call
  const ethIdx = tokensAddresses.indexOf(
    "0x0000000000000000000000000000000000000000",
  );
  if (ethIdx > -1) {
    const coinGeckoEthResp = await fetch(`${API_COINGECKO}ethereum`);

    if (!coinGeckoEthResp.ok) {
      throw new Error("Error while getting eth exchange values");
    }

    const coinGeckoEthRespJson =
      (await coinGeckoEthResp.json()) as IGeckoRespObj;

    response["0x0000000000000000000000000000000000000000"] =
      coinGeckoEthRespJson.ethereum?.usd;

    if (tokensAddresses.length === 1) {
      return response;
    }
  }

  const coinGeckoResp = await fetch(
    `${API_COINGECKO_TOKENS}${network}?contract_addresses=${tokensAddresses.join(
      ",",
    )}&vs_currencies=USD`,
  );

  if (!coinGeckoResp.ok) {
    throw new Error("Error while getting tokens exchange values");
  }

  const coinGeckoRespJson = (await coinGeckoResp.json()) as IGeckoRespObj;

  for (const address in coinGeckoRespJson) {
    response[address] = coinGeckoRespJson[address]?.usd;
  }

  return response;
};

export const getExchangeRates = async (
  chainId: number,
  tokensAddresses: string[],
): Promise<IResult> => {
  let result = {} as IResult;

  try {
    const uniqueTokensAddresses = Array.from(new Set(tokensAddresses));

    result = (await getCoinGeckoPrices(
      CG_NETWORK_ID[chainId],
      uniqueTokensAddresses,
    )) as IResult | any;
  } catch (error) {
    console.error(error);
  }

  return result;
};
