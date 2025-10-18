import { NextRequest, NextResponse } from "next/server";

/**
 * Comprehensive Token API - All CoinGecko Tokens on All Chains
 * Fetches ALL tokens from CoinGecko and maps them to ALL supported chains
 */

// Comprehensive chain mapping
const CHAIN_MAPPING = {
  "ethereum": { chainId: 1, chainName: "Ethereum", symbol: "ETH" },
  "binance-smart-chain": { chainId: 56, chainName: "BSC", symbol: "BNB" },
  "polygon-pos": { chainId: 137, chainName: "Polygon", symbol: "MATIC" },
  "arbitrum-one": { chainId: 42161, chainName: "Arbitrum", symbol: "ETH" },
  "optimistic-ethereum": { chainId: 10, chainName: "Optimism", symbol: "ETH" },
  "avalanche": { chainId: 43114, chainName: "Avalanche", symbol: "AVAX" },
  "base": { chainId: 8453, chainName: "Base", symbol: "ETH" },
  "fantom": { chainId: 250, chainName: "Fantom", symbol: "FTM" },
  "harmony-shard-0": { chainId: 1666600000, chainName: "Harmony", symbol: "ONE" },
  "moonriver": { chainId: 1285, chainName: "Moonriver", symbol: "MOVR" },
  "moonbeam": { chainId: 1284, chainName: "Moonbeam", symbol: "GLMR" },
  "cronos": { chainId: 25, chainName: "Cronos", symbol: "CRO" },
  "celo": { chainId: 42220, chainName: "Celo", symbol: "CELO" },
  "aurora": { chainId: 1313161554, chainName: "Aurora", symbol: "ETH" },
  "metis-andromeda": { chainId: 1088, chainName: "Metis", symbol: "METIS" },
  "kucoin-community-chain": { chainId: 321, chainName: "KCC", symbol: "KCS" },
  "okex-chain": { chainId: 66, chainName: "OKExChain", symbol: "OKT" },
  "solana": { chainId: 99998, chainName: "Solana", symbol: "SOL" },
  "tron": { chainId: 195, chainName: "Tron", symbol: "TRX" },
  "cosmos": { chainId: 99999, chainName: "Cosmos", symbol: "ATOM" },
  "osmosis": { chainId: 42161, chainName: "Osmosis", symbol: "OSMO" },
  "near": { chainId: 1313161554, chainName: "NEAR", symbol: "NEAR" },
  "algorand": { chainId: 4160, chainName: "Algorand", symbol: "ALGO" },
  "cardano": { chainId: 2001, chainName: "Cardano", symbol: "ADA" },
  "polkadot": { chainId: 2001, chainName: "Polkadot", symbol: "DOT" },
  "kusama": { chainId: 2001, chainName: "Kusama", symbol: "KSM" },
  "terra-luna": { chainId: 2001, chainName: "Terra", symbol: "LUNA" },
  "boba-network": { chainId: 288, chainName: "Boba", symbol: "ETH" },
  "gnosis": { chainId: 100, chainName: "Gnosis", symbol: "GNO" },
  "polygon-zkevm": { chainId: 1101, chainName: "Polygon zkEVM", symbol: "ETH" },
  "zksync-era": { chainId: 324, chainName: "zkSync Era", symbol: "ETH" },
  "linea": { chainId: 59144, chainName: "Linea", symbol: "ETH" },
  "scroll": { chainId: 534352, chainName: "Scroll", symbol: "ETH" },
  "mantle": { chainId: 5000, chainName: "Mantle", symbol: "MNT" },
  "blast": { chainId: 81457, chainName: "Blast", symbol: "ETH" },
  "sei": { chainId: 1329, chainName: "Sei", symbol: "SEI" },
  "sui": { chainId: 101, chainName: "Sui", symbol: "SUI" },
  "aptos": { chainId: 101, chainName: "Aptos", symbol: "APT" },
  "injective": { chainId: 101, chainName: "Injective", symbol: "INJ" },
  "thorchain": { chainId: 101, chainName: "THORChain", symbol: "RUNE" },
  "kava": { chainId: 101, chainName: "Kava", symbol: "KAVA" },
  "secret": { chainId: 101, chainName: "Secret", symbol: "SCRT" },
  "persistence": { chainId: 101, chainName: "Persistence", symbol: "XPRT" },
  "stargaze": { chainId: 101, chainName: "Stargaze", symbol: "STARS" },
  "juno": { chainId: 101, chainName: "Juno", symbol: "JUNO" },
  "evmos": { chainId: 101, chainName: "Evmos", symbol: "EVMOS" },
  "axelar": { chainId: 101, chainName: "Axelar", symbol: "AXL" },
  "akash": { chainId: 101, chainName: "Akash", symbol: "AKT" },
  "band": { chainId: 101, chainName: "Band", symbol: "BAND" },
  "bitcoin": { chainId: 0, chainName: "Bitcoin", symbol: "BTC" },
  "litecoin": { chainId: 0, chainName: "Litecoin", symbol: "LTC" },
  "dogecoin": { chainId: 0, chainName: "Dogecoin", symbol: "DOGE" },
  "bitcoin-cash": { chainId: 0, chainName: "Bitcoin Cash", symbol: "BCH" },
  "ripple": { chainId: 0, chainName: "Ripple", symbol: "XRP" },
  "stellar": { chainId: 0, chainName: "Stellar", symbol: "XLM" },
  "monero": { chainId: 0, chainName: "Monero", symbol: "XMR" },
  "zcash": { chainId: 0, chainName: "Zcash", symbol: "ZEC" },
  "dash": { chainId: 0, chainName: "Dash", symbol: "DASH" },
  "ethereum-classic": { chainId: 61, chainName: "Ethereum Classic", symbol: "ETC" },
} as const;

interface TokenWithChains {
  id: string;
  symbol: string;
  name: string;
  logoURI: string;
  chains: Array<{
    chainId: number;
    chainName: string;
    address: string;
    decimals: number;
  }>;
  marketCapRank?: number;
  price?: number;
}

// Cache for all tokens
let allTokensCache: TokenWithChains[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const chainId = searchParams.get("chainId");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const page = parseInt(searchParams.get("page") || "1");

    // Check if we need to refresh cache
    const now = Date.now();
    if (now - cacheTimestamp > CACHE_DURATION || allTokensCache.length === 0) {
      console.log("[All Tokens API] 🔄 Refreshing token cache...");
      await refreshTokenCache();
    }

    let filteredTokens = [...allTokensCache];

    // Apply filters
    if (search && search.length >= 2) {
      const searchLower = search.toLowerCase();
      filteredTokens = filteredTokens.filter(token => 
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower) ||
        token.id.toLowerCase().includes(searchLower)
      );
    }

    if (chainId) {
      const chainIdNum = parseInt(chainId);
      filteredTokens = filteredTokens.filter(token => 
        token.chains.some(chain => chain.chainId === chainIdNum)
      );
    }

    // Sort by market cap rank (lower number = higher rank)
    filteredTokens.sort((a, b) => {
      const rankA = a.marketCapRank || 999999;
      const rankB = b.marketCapRank || 999999;
      return rankA - rankB;
    });

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTokens = filteredTokens.slice(start, end);

    console.log(`[All Tokens API] ✅ Returning ${paginatedTokens.length} tokens (${filteredTokens.length} total)`);

    return NextResponse.json({
      success: true,
      data: paginatedTokens,
      total: filteredTokens.length,
      page,
      limit,
      cached: now - cacheTimestamp < CACHE_DURATION,
    });

  } catch (error) {
    console.error("[All Tokens API] ❌ Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tokens",
    }, { status: 500 });
  }
}

async function refreshTokenCache() {
  try {
    console.log("[All Tokens API] 🚀 Fetching all tokens from CoinGecko...");
    
    // Fetch all tokens from CoinGecko (paginated to get comprehensive list)
    const allTokens: TokenWithChains[] = [];
    let page = 1;
    const perPage = 250; // CoinGecko max per page
    
    while (page <= 10) { // Limit to 2500 tokens to avoid rate limits
      console.log(`[All Tokens API] 📄 Fetching page ${page}...`);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&locale=en`,
        {
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 1800 }, // Cache for 30 minutes
        }
      );

      if (!response.ok) {
        console.warn(`[All Tokens API] ⚠️ Page ${page} failed: ${response.status}`);
        break;
      }

      const tokens = await response.json();
      if (tokens.length === 0) break;

      // Process tokens for this page
      for (const token of tokens) {
        try {
          // Fetch detailed token info to get platforms
          const detailResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${token.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
            {
              headers: { 'Accept': 'application/json' },
              next: { revalidate: 3600 }, // Cache for 1 hour
            }
          );

          if (detailResponse.ok) {
            const detail = await detailResponse.json();
            const platforms = detail.platforms || {};
            
            // Map platforms to chains
            const chains = Object.entries(platforms)
              .map(([platform, address]) => {
                const chainInfo = CHAIN_MAPPING[platform as keyof typeof CHAIN_MAPPING];
                if (chainInfo && typeof address === 'string') {
                  return {
                    chainId: chainInfo.chainId,
                    chainName: chainInfo.chainName,
                    address: address,
                    decimals: 18, // Default, could be improved with more detailed API calls
                  };
                }
                return null;
              })
              .filter(Boolean) as Array<{
                chainId: number;
                chainName: string;
                address: string;
                decimals: number;
              }>;

            // Only include tokens that are available on at least one chain
            if (chains.length > 0) {
              allTokens.push({
                id: token.id,
                symbol: token.symbol.toUpperCase(),
                name: token.name,
                logoURI: token.image || detail.image?.small || detail.image?.thumb,
                chains,
                marketCapRank: token.market_cap_rank,
                price: token.current_price,
              });
            }
          }

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.warn(`[All Tokens API] ⚠️ Failed to process token ${token.id}:`, error);
        }
      }

      page++;
      
      // Delay between pages to avoid rate limits
      if (page <= 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    allTokensCache = allTokens;
    cacheTimestamp = Date.now();
    
    console.log(`[All Tokens API] ✅ Cached ${allTokens.length} tokens across all chains`);
    
  } catch (error) {
    console.error("[All Tokens API] ❌ Cache refresh failed:", error);
    throw error;
  }
}
