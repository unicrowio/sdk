export const STABLE_COINS = ["DAI", "USDC", "USDT"];

export interface IResult {
  [key: string]: number | undefined;
}

interface IGeckoRespObj {
  [key: string]: { usd: number | undefined };
  ethereum: { usd: number | undefined };
}

const API_COINGECKO =
  "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=";

const getCoinGeckoObj = async (
  normalizedSymbols: string[],
): Promise<IGeckoRespObj | void> => {
  const coinGeckoResp = await fetch(
    `${API_COINGECKO}${normalizedSymbols.join(",")}`,
  );

  if (!coinGeckoResp.ok) {
    throw new Error("Error while getting exchange values");
  }

  const response = await coinGeckoResp.json();

  return response as IGeckoRespObj;
};

export const getExchangeRates = async (
  tokensSymbols: string[],
): Promise<IResult> => {
  const result = {} as IResult;

  try {
    const uniqueTokenSymbols = Array.from(new Set(tokensSymbols));
    const nonStableSymbols = uniqueTokenSymbols.filter(
      (token) => !STABLE_COINS.includes(token),
    );

    uniqueTokenSymbols.forEach((symbol: string) => {
      result[symbol] = undefined;
    });

    let geckoRespObj = {} as IGeckoRespObj | any;
    if (nonStableSymbols.length > 0) {
      const normalizedSymbols = nonStableSymbols.map((symbol) =>
        symbol === "ETH" ? "ETHEREUM" : symbol,
      );

      geckoRespObj = await getCoinGeckoObj(normalizedSymbols);
    }

    uniqueTokenSymbols.forEach((symbol) => {
      if (!symbol) return;
      const upperCaseSymbol = symbol.toUpperCase();
      if (STABLE_COINS.includes(upperCaseSymbol)) {
        // 1 to 1 conversion for stable coins against USD
        result[upperCaseSymbol] = 1;
      } else if (upperCaseSymbol === "ETH") {
        result[upperCaseSymbol] = geckoRespObj?.ethereum?.usd;
      } else {
        result[upperCaseSymbol] = geckoRespObj
          ? geckoRespObj[symbol.toLowerCase()]?.usd
          : undefined;
      }
    });
  } catch (error) {
    console.error(error);
  }

  return result;
};
