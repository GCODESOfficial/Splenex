/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getCachedQuote, setCachedQuote } from "./quote-cache";

/**
 * Multi-Aggregator Quote System
 * Tries multiple DEX aggregators to ensure maximum token coverage
 * Order: LiFi → 1inch → 0x → Paraswap → PancakeSwap
 * Now with 30-second caching for faster repeated requests!
 */

interface QuoteRequest {
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  fromAddress: string
  toAddress?: string
  slippage?: number
}

interface UnifiedQuote {
  provider: "lifi" | "1inch" | "0x" | "paraswap" | "pancakeswap"
  toAmount: string
  toAmountMin: string
  estimatedGas: string
  transactionRequest: any
  route?: any
  estimate?: any
}

const LIFI_API_KEY = process.env.LIFI_API_KEY
const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY || ""
const ZEROX_API_KEY = process.env.ZEROX_API_KEY || ""

// Chain ID mapping for different aggregators
const CHAIN_ID_MAP: { [key: number]: string } = {
  1: "ethereum",
  56: "bsc",
  137: "polygon",
  42161: "arbitrum",
  10: "optimism",
  43114: "avalanche",
  8453: "base",
  250: "fantom",
}

/**
 * Try LiFi first (best for cross-chain)
 */
async function getLiFiQuote(request: QuoteRequest): Promise<UnifiedQuote | null> {
  try {
    if (!LIFI_API_KEY) {
      console.log("[Aggregator] LiFi API key not configured");
      return null;
    }

    console.log("[Aggregator] 🔵 Trying LiFi...");
    
    const slippageDecimal = request.slippage ? (request.slippage / 100).toString() : "0.005";
    
    const params = new URLSearchParams({
      fromChain: request.fromChain.toString(),
      toChain: request.toChain.toString(),
      fromToken: request.fromToken,
      toToken: request.toToken,
      fromAmount: request.fromAmount,
      fromAddress: request.fromAddress,
      ...(request.toAddress && { toAddress: request.toAddress }),
      slippage: slippageDecimal,
      integrator: "splenex-dex",
      allowSwitchChain: "true",
      maxPriceImpact: "0.5",
    });

    const response = await fetch(`https://li.quest/v1/quote?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-lifi-api-key": LIFI_API_KEY,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.log(`[Aggregator] LiFi failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("[Aggregator] ✅ LiFi quote received!");
    
    return {
      provider: "lifi",
      toAmount: data.estimate.toAmount,
      toAmountMin: data.estimate.toAmountMin,
      estimatedGas: data.estimate.gasCosts?.[0]?.estimate || "0",
      transactionRequest: data.transactionRequest,
      route: data,
      estimate: data.estimate,
    };
  } catch (error) {
    console.log("[Aggregator] LiFi error:", error instanceof Error ? error.message : "Unknown");
    return null;
  }
}

/**
 * Try 1inch (excellent for single-chain swaps)
 */
async function get1inchQuote(request: QuoteRequest): Promise<UnifiedQuote | null> {
  try {
    // 1inch only supports same-chain swaps
    if (request.fromChain !== request.toChain) {
      console.log("[Aggregator] 1inch skipped (cross-chain not supported)");
      return null;
    }

    console.log("[Aggregator] 🟢 Trying 1inch...");
    
    const slippagePercent = request.slippage || 0.5;
    
    const params = new URLSearchParams({
      src: request.fromToken,
      dst: request.toToken,
      amount: request.fromAmount,
      from: request.fromAddress,
      slippage: slippagePercent.toString(),
      disableEstimate: "false",
      allowPartialFill: "false",
    });

    const headers: any = {
      "Accept": "application/json",
    };
    
    if (ONEINCH_API_KEY) {
      headers["Authorization"] = `Bearer ${ONEINCH_API_KEY}`;
    }

    const response = await fetch(
      `https://api.1inch.dev/swap/v6.0/${request.fromChain}/swap?${params}`,
      {
        headers,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.log(`[Aggregator] 1inch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("[Aggregator] ✅ 1inch quote received!");
    
    return {
      provider: "1inch",
      toAmount: data.dstAmount || data.toAmount,
      toAmountMin: data.dstAmount || data.toAmount, // 1inch already factors slippage
      estimatedGas: data.gas || "0",
      transactionRequest: {
        to: data.tx.to,
        data: data.tx.data,
        value: data.tx.value,
        from: data.tx.from,
        gasLimit: data.tx.gas,
      },
      route: data,
    };
  } catch (error) {
    console.log("[Aggregator] 1inch error:", error instanceof Error ? error.message : "Unknown");
    return null;
  }
}

/**
 * Try 0x API (powers Matcha, excellent coverage)
 */
async function get0xQuote(request: QuoteRequest): Promise<UnifiedQuote | null> {
  try {
    // 0x only supports same-chain swaps
    if (request.fromChain !== request.toChain) {
      console.log("[Aggregator] 0x skipped (cross-chain not supported)");
      return null;
    }

    // 0x supports limited chains
    const supportedChains = [1, 56, 137, 42161, 10, 43114, 8453];
    if (!supportedChains.includes(request.fromChain)) {
      console.log("[Aggregator] 0x skipped (chain not supported)");
      return null;
    }

    console.log("[Aggregator] 🟣 Trying 0x...");
    
    const slippageDecimal = (request.slippage || 0.5) / 100;
    
    const params = new URLSearchParams({
      sellToken: request.fromToken,
      buyToken: request.toToken,
      sellAmount: request.fromAmount,
      takerAddress: request.fromAddress,
      slippagePercentage: slippageDecimal.toString(),
    });

    const headers: any = {
      "0x-api-key": ZEROX_API_KEY || "demo-api-key",
      "0x-version": "v2",
    };

    const response = await fetch(
      `https://api.0x.org/swap/v1/quote?${params}`,
      {
        headers,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.log(`[Aggregator] 0x failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("[Aggregator] ✅ 0x quote received!");
    
    return {
      provider: "0x",
      toAmount: data.buyAmount,
      toAmountMin: data.guaranteedPrice ? 
        (BigInt(data.buyAmount) * BigInt(Math.floor((1 - slippageDecimal) * 10000)) / BigInt(10000)).toString() :
        data.buyAmount,
      estimatedGas: data.estimatedGas || data.gas || "0",
      transactionRequest: {
        to: data.to,
        data: data.data,
        value: data.value,
        from: request.fromAddress,
        gasLimit: data.gas,
      },
      route: data,
    };
  } catch (error) {
    console.log("[Aggregator] 0x error:", error instanceof Error ? error.message : "Unknown");
    return null;
  }
}

/**
 * Try Paraswap (great backup option)
 */
async function getParaswapQuote(request: QuoteRequest): Promise<UnifiedQuote | null> {
  try {
    // Paraswap only supports same-chain swaps
    if (request.fromChain !== request.toChain) {
      console.log("[Aggregator] Paraswap skipped (cross-chain not supported)");
      return null;
    }

    console.log("[Aggregator] 🟡 Trying Paraswap...");
    
    const slippagePercent = (request.slippage || 0.5) * 100; // Paraswap expects basis points
    
    const params = new URLSearchParams({
      srcToken: request.fromToken,
      destToken: request.toToken,
      srcDecimals: "18", // We'll need to get this dynamically
      destDecimals: "18",
      amount: request.fromAmount,
      side: "SELL",
      network: request.fromChain.toString(),
      userAddress: request.fromAddress,
    });

    const priceResponse = await fetch(
      `https://apiv5.paraswap.io/prices?${params}`,
      {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!priceResponse.ok) {
      console.log(`[Aggregator] Paraswap failed: ${priceResponse.status}`);
      return null;
    }

    const priceData = await priceResponse.json();
    
    // Build transaction
    const txResponse = await fetch(
      `https://apiv5.paraswap.io/transactions/${request.fromChain}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          srcToken: request.fromToken,
          destToken: request.toToken,
          srcAmount: request.fromAmount,
          destAmount: priceData.priceRoute.destAmount,
          priceRoute: priceData.priceRoute,
          userAddress: request.fromAddress,
          partner: "splenex",
          slippage: slippagePercent,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!txResponse.ok) {
      console.log(`[Aggregator] Paraswap tx build failed: ${txResponse.status}`);
      return null;
    }

    const txData = await txResponse.json();
    console.log("[Aggregator] ✅ Paraswap quote received!");
    
    return {
      provider: "paraswap",
      toAmount: priceData.priceRoute.destAmount,
      toAmountMin: priceData.priceRoute.destAmount, // Already includes slippage
      estimatedGas: priceData.priceRoute.gasCost || "0",
      transactionRequest: {
        to: txData.to,
        data: txData.data,
        value: txData.value,
        from: request.fromAddress,
        gasLimit: priceData.priceRoute.gasCost,
      },
      route: priceData.priceRoute,
    };
  } catch (error) {
    console.log("[Aggregator] Paraswap error:", error instanceof Error ? error.message : "Unknown");
    return null;
  }
}

/**
 * Try PancakeSwap (excellent for BSC and multi-chain)
 */
async function getPancakeSwapQuote(request: QuoteRequest): Promise<UnifiedQuote | null> {
  try {
    // PancakeSwap supports BSC, Ethereum, and other chains
    const supportedChains = [1, 56, 137, 42161, 10, 43114, 8453, 25]; // ETH, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base, Cronos
    
    // Only same-chain swaps
    if (request.fromChain !== request.toChain) {
      console.log("[Aggregator] PancakeSwap skipped (cross-chain not supported)");
      return null;
    }
    
    if (!supportedChains.includes(request.fromChain)) {
      console.log("[Aggregator] PancakeSwap skipped (chain not supported)");
      return null;
    }

    console.log("[Aggregator] 🥞 Trying PancakeSwap...");
    
    const slippagePercent = (request.slippage || 0.5) * 100; // Convert to basis points
    
    // PancakeSwap Smart Router API v3
    const quoteParams = new URLSearchParams({
      chainId: request.fromChain.toString(),
      inputCurrency: request.fromToken,
      outputCurrency: request.toToken,
      amount: request.fromAmount,
      trader: request.fromAddress,
      slippageTolerance: slippagePercent.toString(),
    });

    // Try PancakeSwap's Smart Router API
    const quoteResponse = await fetch(
      `https://api.pancakeswap.com/v3/quote?${quoteParams}`,
      {
        headers: {
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!quoteResponse.ok) {
      console.log(`[Aggregator] PancakeSwap failed: ${quoteResponse.status}`);
      return null;
    }

    const quoteData = await quoteResponse.json();
    
    if (!quoteData || !quoteData.outputAmount) {
      console.log("[Aggregator] PancakeSwap: No valid quote data");
      return null;
    }

    console.log("[Aggregator] ✅ PancakeSwap quote received!");
    
    // Calculate minimum output with slippage
    const slippageMultiplier = 1 - (slippagePercent / 10000);
    const toAmountMin = (BigInt(quoteData.outputAmount) * BigInt(Math.floor(slippageMultiplier * 10000)) / BigInt(10000)).toString();
    
    return {
      provider: "pancakeswap",
      toAmount: quoteData.outputAmount,
      toAmountMin: toAmountMin,
      estimatedGas: quoteData.estimatedGas || "300000", // Default gas estimate
      transactionRequest: {
        to: quoteData.to || quoteData.routerAddress,
        data: quoteData.data || quoteData.calldata,
        value: quoteData.value || "0",
        from: request.fromAddress,
        gasLimit: quoteData.estimatedGas || "300000",
      },
      route: quoteData,
    };
  } catch (error) {
    console.log("[Aggregator] PancakeSwap error:", error instanceof Error ? error.message : "Unknown");
    return null;
  }
}

/**
 * Main function: Try all aggregators and return the best quote
 */
export async function getMultiAggregatorQuote(request: QuoteRequest) {
  console.log("[Aggregator] 🚀 Starting multi-aggregator quote search...");
  console.log(`[Aggregator] From: ${request.fromToken} (chain ${request.fromChain})`);
  console.log(`[Aggregator] To: ${request.toToken} (chain ${request.toChain})`);
  console.log(`[Aggregator] Amount: ${request.fromAmount}`);
  
  // Check cache first for instant response
  const cachedQuote = getCachedQuote(request);
  if (cachedQuote) {
    console.log("[Aggregator] ⚡ Returning cached quote (instant!)");
    return {
      success: true,
      data: cachedQuote,
      provider: cachedQuote.provider,
    };
  }
  
  const isCrossChain = request.fromChain !== request.toChain;
  
  // Optimized: Try fastest aggregators first, with early return
  // LiFi is fastest for cross-chain, 1inch for same-chain
  const aggregators = isCrossChain 
    ? [getLiFiQuote, get1inchQuote, get0xQuote, getParaswapQuote, getPancakeSwapQuote]
    : [get1inchQuote, get0xQuote, getLiFiQuote, getParaswapQuote, getPancakeSwapQuote];
  
  // Try aggregators sequentially with early return for better performance
  for (let i = 0; i < aggregators.length; i++) {
    try {
      console.log(`[Aggregator] ⚡ Trying aggregator ${i + 1}/${aggregators.length}...`);
      const quote = await Promise.race([
        aggregators[i](request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000)) // 6s per aggregator
      ]);
      
      if (quote) {
        console.log(`[Aggregator] ✅ Got quote from aggregator ${i + 1} in <6s`);
        
        // Cache the successful quote for faster future requests
        setCachedQuote(request, quote);
        
        return {
          success: true,
          data: quote,
          provider: quote.provider,
        };
      }
    } catch (error) {
      console.log(`[Aggregator] ⚠️ Aggregator ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      continue; // Try next aggregator
    }
  }
  
  // Fallback: Try all aggregators in parallel if sequential failed
  console.log("[Aggregator] 🔄 Sequential failed, trying parallel fallback...");
  const quotes = await Promise.allSettled([
    getLiFiQuote(request),
    get1inchQuote(request),
    get0xQuote(request),
    getParaswapQuote(request),
    getPancakeSwapQuote(request),
  ]);

  // Extract successful quotes
  const successfulQuotes = quotes
    .map((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        return result.value;
      }
      return null;
    })
    .filter((q): q is UnifiedQuote => q !== null);

  if (successfulQuotes.length === 0) {
    console.log("[Aggregator] ❌ No aggregator could provide a quote");
    return {
      success: false,
      error: "No routes available from any aggregator. Token pair might have insufficient liquidity or restrictions.",
      attemptedProviders: ["lifi", "1inch", "0x", "paraswap", "pancakeswap"],
    };
  }

  // Sort by best output amount (toAmount)
  successfulQuotes.sort((a, b) => {
    const amountA = BigInt(a.toAmount);
    const amountB = BigInt(b.toAmount);
    return amountA > amountB ? -1 : 1;
  });

  const bestQuote = successfulQuotes[0];
  
  // Cache the best quote for faster future requests
  setCachedQuote(request, bestQuote);
  
  console.log(`[Aggregator] ✅ Best quote from: ${bestQuote.provider.toUpperCase()}`);
  console.log(`[Aggregator] Output amount: ${bestQuote.toAmount}`);
  console.log(`[Aggregator] Total providers checked: ${successfulQuotes.length}`);
  
  // Log all quotes for comparison
  if (successfulQuotes.length > 1) {
    console.log("[Aggregator] 📊 All quotes received:");
    successfulQuotes.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q.provider}: ${q.toAmount}`);
    });
  }

  return {
    success: true,
    data: bestQuote,
    allQuotes: successfulQuotes,
    totalProviders: successfulQuotes.length,
  };
}

/**
 * Get quote from specific provider (for testing)
 */
export async function getQuoteFromProvider(
  request: QuoteRequest,
  provider: "lifi" | "1inch" | "0x" | "paraswap" | "pancakeswap"
) {
  console.log(`[Aggregator] Getting quote from ${provider.toUpperCase()} only...`);
  
  let quote: UnifiedQuote | null = null;
  
  switch (provider) {
    case "lifi":
      quote = await getLiFiQuote(request);
      break;
    case "1inch":
      quote = await get1inchQuote(request);
      break;
    case "0x":
      quote = await get0xQuote(request);
      break;
    case "paraswap":
      quote = await getParaswapQuote(request);
      break;
    case "pancakeswap":
      quote = await getPancakeSwapQuote(request);
      break;
  }
  
  if (!quote) {
    return {
      success: false,
      error: `${provider} could not provide a quote`,
    };
  }
  
  return {
    success: true,
    data: quote,
  };
}

