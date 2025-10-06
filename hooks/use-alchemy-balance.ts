/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";

export interface TokenBalance {
  symbol: string;
  name?: string;
  balance: string;
  usd?: number;
  price?: number;
  chain?: string;
}

export interface AlchemyBalances {
  totalUsd: number;
  nativeSum: number;
  tokens: TokenBalance[];
  refresh: () => Promise<void>;
}

/**
 * Independent balance reader (no useWallet dependency).
 * Fetches native balances across EVM chains with Alchemy RPC + CoinGecko prices.
 */
export function useAlchemyBalance(address?: string | null): AlchemyBalances {
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [nativeSum, setNativeSum] = useState(0);

  const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

  const CHAINS = [
    { name: "Ethereum", rpc: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, symbol: "ETH" },
    { name: "Polygon", rpc: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, symbol: "MATIC" },
    { name: "Arbitrum", rpc: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, symbol: "ETH" },
    { name: "Optimism", rpc: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, symbol: "ETH" },
    { name: "Base", rpc: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, symbol: "ETH" },
    { name: "BSC", rpc: "https://bsc-dataseed.binance.org", symbol: "BNB" },
  ];

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    try {
      const balances: TokenBalance[] = [];
      let totalUsdValue = 0;
      let totalNativeValue = 0;

      await Promise.all(
        CHAINS.map(async (chain) => {
          try {
            const body = {
              jsonrpc: "2.0",
              id: 1,
              method: "eth_getBalance",
              params: [address, "latest"],
            };

            const res = await fetch(chain.rpc, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!data?.result) return;

            const nativeAmount = parseInt(data.result, 16) / 1e18;
            totalNativeValue += nativeAmount;

            // fetch USD price
            const priceRes = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${chain.symbol.toLowerCase()}&vs_currencies=usd`
            );
            const priceJson = await priceRes.json();
            const usdPrice = priceJson?.[chain.symbol.toLowerCase()]?.usd ?? 0;
            const usdValue = usdPrice * nativeAmount;

            balances.push({
              symbol: chain.symbol,
              name: chain.name,
              balance: nativeAmount.toFixed(4),
              usd: usdValue,
              price: usdPrice,
              chain: chain.name,
            });

            totalUsdValue += usdValue;
          } catch (err) {
            console.warn(`Error fetching balance for ${chain.name}:`, err);
          }
        })
      );

      setTokens(balances);
      setTotalUsd(totalUsdValue);
      setNativeSum(totalNativeValue);
    } catch (err) {
      console.error("Alchemy balance fetch failed:", err);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    totalUsd,
    nativeSum,
    tokens,
    refresh: fetchBalances,
  };
}
