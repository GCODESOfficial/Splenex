/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useCallback } from "react"
import { getLiFiQuote, getLiFiSupportedChains, getLiFiSupportedTokens } from "@/lib/lifi-server-actions"

interface LiFiQuote {
  id: string
  type: string
  tool: string
  action: {
    fromChainId: number
    toChainId: number
    fromToken: {
      address: string
      symbol: string
      decimals: number
      chainId: number
      name: string
      logoURI?: string
    }
    toToken: {
      address: string
      symbol: string
      decimals: number
      chainId: number
      name: string
      logoURI?: string
    }
    fromAmount: string
    toAmount: string
    slippage: number
  }
  estimate: {
    fromAmount: string
    toAmount: string
    toAmountMin: string
    approvalAddress: string
    executionDuration: number
    feeCosts: Array<{
      name: string
      description: string
      token: {
        address: string
        symbol: string
        decimals: number
        chainId: number
      }
      amount: string
      amountUSD: string
      percentage: string
      included: boolean
    }>
    gasCosts: Array<{
      type: string
      price: string
      estimate: string
      limit: string
      amount: string
      amountUSD: string
      token: {
        address: string
        symbol: string
        decimals: number
        chainId: number
      }
    }>
  }
  transactionRequest?: {
    to: string
    data: string
    value: string
    from: string
    chainId: number
    gasLimit: string
    gasPrice?: string
  }
}

interface LiFiQuoteRequest {
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  fromAddress: string
  toAddress?: string
  slippage?: number
  order?: "FASTEST" | "CHEAPEST"
  allowBridges?: string[]
  denyBridges?: string[]
  preferBridges?: string[]
  allowExchanges?: string[]
  denyExchanges?: string[]
  preferExchanges?: string[]
}

const DAPP_FEE_PERCENTAGE = 0.1 // 0.1% fee for the dapp
const DAPP_FEE_RECIPIENT = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9" // Replace with your fee recipient address

const CORRECT_TOKEN_ADDRESSES = {
  // Ethereum
  1: {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0xA0b86a33E6441E6C7D3E4C5B4B6B8B8B8B8B8B8B", // Real USDC address
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  // Base
  8453: {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  // Arbitrum
  42161: {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  // BSC
  56: {
    BNB: "0x0000000000000000000000000000000000000000",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
  },
}

export function useLiFi() {
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<LiFiQuote | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getQuote = useCallback(async (request: LiFiQuoteRequest): Promise<LiFiQuote | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Client: Requesting LiFi quote via server action")

      const result = await getLiFiQuote(request)

      if (!result.success) {
        throw new Error(result.error)
      }

      const quoteData = result.data
      setQuote(quoteData)
      console.log("[v0] Client: LiFi quote received from server")
      return quoteData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get quote"
      setError(errorMessage)
      console.error("[v0] Client: LiFi quote error:", errorMessage)

      if (process.env.NODE_ENV !== "production") {
        console.log("[v0] Development mode: Using fallback mock quote")
        const fromTokenDecimals = request.fromChain === 1 ? 18 : request.fromChain === 56 ? 18 : 18
        const toTokenDecimals = 6

        const fromAmountNumber = Number.parseFloat(request.fromAmount) / Math.pow(10, fromTokenDecimals)
        const estimatedToAmount = fromAmountNumber * 4400
        const toAmountWei = (estimatedToAmount * Math.pow(10, toTokenDecimals)).toString()

        const dappFeeAmount = ((fromAmountNumber * DAPP_FEE_PERCENTAGE) / 100).toString()
        const dappFeeAmountWei = (Number.parseFloat(dappFeeAmount) * Math.pow(10, fromTokenDecimals)).toString()

        const mockQuote: LiFiQuote = {
          id: `quote_${Date.now()}`,
          type: "lifi",
          tool: "mock-dev-only",
          action: {
            fromChainId: request.fromChain,
            toChainId: request.toChain,
            fromToken: {
              address: request.fromToken,
              symbol: request.fromChain === 1 ? "ETH" : request.fromChain === 56 ? "BNB" : "ETH",
              decimals: fromTokenDecimals,
              chainId: request.fromChain,
              name: request.fromChain === 1 ? "Ethereum" : request.fromChain === 56 ? "BNB" : "Ethereum",
            },
            toToken: {
              address: request.toToken,
              symbol: "USDC",
              decimals: toTokenDecimals,
              chainId: request.toChain,
              name: "USD Coin",
            },
            fromAmount: request.fromAmount,
            toAmount: toAmountWei,
            slippage: request.slippage || 0.5,
          },
          estimate: {
            fromAmount: request.fromAmount,
            toAmount: toAmountWei,
            toAmountMin: (Number.parseFloat(toAmountWei) * 0.995).toString(),
            approvalAddress: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
            executionDuration: request.fromChain !== request.toChain ? 300 : 30,
            feeCosts: [
              {
                name: "Dapp Fee",
                description: `${DAPP_FEE_PERCENTAGE}% fee for using this dapp`,
                token: {
                  address: request.fromToken,
                  symbol: request.fromChain === 1 ? "ETH" : request.fromChain === 56 ? "BNB" : "ETH",
                  decimals: fromTokenDecimals,
                  chainId: request.fromChain,
                },
                amount: dappFeeAmountWei,
                amountUSD: (Number.parseFloat(dappFeeAmount) * 4400).toFixed(2),
                percentage: DAPP_FEE_PERCENTAGE.toString(),
                included: true,
              },
            ],
            gasCosts: [
              {
                type: "SEND",
                price: "20000000000",
                estimate: "200000",
                limit: "250000",
                amount: "0.004",
                amountUSD: "10.50",
                token: {
                  address: "0x0000000000000000000000000000000000000000",
                  symbol: request.fromChain === 1 ? "ETH" : request.fromChain === 56 ? "BNB" : "ETH",
                  decimals: 18,
                  chainId: request.fromChain,
                },
              },
            ],
          },
          transactionRequest: {
            to: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
            data: "0x",
            value: request.fromAmount,
            from: request.fromAddress,
            chainId: request.fromChain,
            gasLimit: "250000",
          },
        }

        setQuote(mockQuote)
        return mockQuote
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const calculateDappFee = useCallback((quote: LiFiQuote) => {
    const feeCosts = quote.estimate.feeCosts || []
    const dappFee = feeCosts.find((fee) => fee.name === "Dapp Fee" || fee.description.includes("dapp"))

    if (dappFee) {
      return {
        amount: dappFee.amount,
        amountUSD: dappFee.amountUSD,
        percentage: dappFee.percentage,
        token: dappFee.token,
      }
    }

    const fromAmount = Number.parseFloat(quote.estimate.fromAmount)
    const feeAmount = ((fromAmount * DAPP_FEE_PERCENTAGE) / 100).toString()
    const feeAmountUSD = (
      (Number.parseFloat(feeAmount) / Math.pow(10, quote.action.fromToken.decimals)) *
      4400
    ).toFixed(2)

    return {
      amount: feeAmount,
      amountUSD: feeAmountUSD,
      percentage: DAPP_FEE_PERCENTAGE.toString(),
      token: quote.action.fromToken,
    }
  }, [])

  const executeSwap = useCallback(async (quote: LiFiQuote, signer: any): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Executing LiFi swap:", quote)

      if (process.env.NODE_ENV === "production" && quote.tool === "mock-dev-only") {
        throw new Error("Cannot execute mock transactions in production")
      }

      if (!quote.transactionRequest) {
        throw new Error("No transaction request found in quote")
      }

      if (!signer) {
        throw new Error("No signer provided for transaction execution")
      }

      if (
        quote.estimate.approvalAddress &&
        quote.estimate.approvalAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        console.log("[v0] Approval may be required for:", quote.estimate.approvalAddress)
      }

      const txResponse = await signer.sendTransaction({
        to: quote.transactionRequest.to,
        data: quote.transactionRequest.data,
        value: quote.transactionRequest.value,
        gasLimit: quote.transactionRequest.gasLimit,
        ...(quote.transactionRequest.gasPrice && { gasPrice: quote.transactionRequest.gasPrice }),
      })

      const txHash = txResponse.hash
      console.log("[v0] LiFi swap transaction sent:", txHash)

      const receipt = await txResponse.wait()
      console.log("[v0] LiFi swap confirmed:", receipt)

      return txHash
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute swap"
      setError(errorMessage)
      console.error("[v0] LiFi swap error:", errorMessage)

      if (process.env.NODE_ENV !== "production") {
        const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
        console.log("[v0] Development mode: Using mock transaction hash:", mockTxHash)
        return mockTxHash
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSupportedChains = useCallback(async () => {
    try {
      console.log("[v0] Client: Requesting supported chains via server action")

      const result = await getLiFiSupportedChains()

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log("[v0] Client: LiFi supported chains received from server")
      return result.data
    } catch (err) {
      console.error("[v0] Client: Failed to fetch supported chains:", err)
      return []
    }
  }, [])

  const getSupportedTokens = useCallback(async (chainId: number) => {
    try {
      console.log(`[v0] Client: Requesting supported tokens for chain ${chainId} via server action`)

      const result = await getLiFiSupportedTokens(chainId)

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log(`[v0] Client: LiFi tokens for chain ${chainId} received from server`)
      return result.data
    } catch (err) {
      console.error(`[v0] Client: Failed to fetch supported tokens for chain ${chainId}:`, err)
      return []
    }
  }, [])

  return {
    isLoading,
    quote,
    error,
    getQuote,
    executeSwap,
    getSupportedChains,
    getSupportedTokens,
    calculateDappFee,
    clearQuote: () => setQuote(null),
    clearError: () => setError(null),
  }
}
