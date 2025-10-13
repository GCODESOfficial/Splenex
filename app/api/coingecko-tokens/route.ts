import { NextRequest, NextResponse } from "next/server";
import {
  fetchCoinGeckoTokens,
  searchCoinGeckoTokens,
  getCoinGeckoTokensByChain,
  getTrendingTokens,
} from "@/lib/coingecko-service";

// Pre-warm cache on server startup (runs in background)
let isWarming = false;
let warmupComplete = false;

if (!isWarming && !warmupComplete) {
  isWarming = true;
  console.log("[CoinGecko API] 🔥 Starting token cache warmup in background...");
  fetchCoinGeckoTokens()
    .then((tokens) => {
      warmupComplete = true;
      console.log(`[CoinGecko API] ✅ Cache warmed up with ${tokens.length} tokens`);
    })
    .catch((err) => {
      isWarming = false;
      console.error("[CoinGecko API] ❌ Cache warmup failed:", err);
    });
}

/**
 * GET /api/coingecko-tokens
 * Fetch tokens from CoinGecko with real logos
 * 
 * Query params:
 * - search: string (search query)
 * - chainId: number (filter by chain)
 * - trending: boolean (get trending tokens)
 * - limit: number (results limit)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const chainId = searchParams.get("chainId");
    const trending = searchParams.get("trending");

    // Get trending tokens
    if (trending === "true") {
      const trendingTokens = await getTrendingTokens();
      return NextResponse.json({
        success: true,
        data: trendingTokens,
        count: trendingTokens.length,
      });
    }

    // Search tokens (fast with cache)
    if (search) {
      const searchResults = await searchCoinGeckoTokens(
        search,
        chainId ? parseInt(chainId) : undefined
      );
      return NextResponse.json({
        success: true,
        data: searchResults.slice(0, 100), // Limit for performance
        count: searchResults.length,
      });
    }

    // Get tokens by chain (fast with cache)
    if (chainId) {
      const chainTokens = await getCoinGeckoTokensByChain(parseInt(chainId));
      return NextResponse.json({
        success: true,
        data: chainTokens.slice(0, 100), // Limit for performance
        count: chainTokens.length,
      });
    }

    // Get all tokens (from cache if available)
    const allTokens = await fetchCoinGeckoTokens();
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTokens = allTokens.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginatedTokens,
      count: paginatedTokens.length,
      total: allTokens.length,
      page,
      limit,
      cached: warmupComplete,
    });
  } catch (error) {
    console.error("[API] Error fetching CoinGecko tokens:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch tokens",
      },
      { status: 500 }
    );
  }
}

