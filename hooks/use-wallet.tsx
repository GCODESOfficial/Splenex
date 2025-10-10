/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"

type ChainKey = "0x1" | "0x2105" | "0xa4b1" | "0x38"

interface TokenBalance {
  symbol: string
  name: string
  balance: string
  usdValue: number
  price: number
  address: string
  chain?: string
}

interface WalletContextType {
  address: string | null
  isConnected: boolean
  chainId: string | null
  balance: string | null
  totalUsdBalance: number
  tokenBalances: TokenBalance[]
  isConnecting: boolean
  connectingWallet: string | null
  connect: (walletType?: string) => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: string) => Promise<void>
  detectWallets: () => Array<{ id: string; name: string; provider: any }>
  refreshBalances: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

const SUPPORTED_CHAINS: Record<
  ChainKey,
  { name: string; rpc: string[]; moralisChain: string }
> = {
  "0x1": {
    name: "Ethereum",
    rpc: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://ethereum.publicnode.com"],
    moralisChain: "eth",
  },
  "0x2105": {
    name: "Base",
    rpc: ["https://mainnet.base.org", "https://base.llamarpc.com", "https://base.publicnode.com"],
    moralisChain: "base",
  },
  "0xa4b1": {
    name: "Arbitrum",
    rpc: ["https://arb1.arbitrum.io/rpc", "https://arbitrum.llamarpc.com", "https://arbitrum.publicnode.com"],
    moralisChain: "arbitrum",
  },
  "0x38": {
    name: "BSC",
    rpc: ["https://bsc-dataseed.binance.org", "https://bsc.publicnode.com", "https://bsc.llamarpc.com"],
    moralisChain: "bsc",
  },
}

// safe accessor for runtime chainId strings
function getChainConfig(id?: string) {
  if (!id) return undefined
  return SUPPORTED_CHAINS[id as ChainKey]
}

const POPULAR_TOKENS: {
  [chainId in ChainKey]: Array<{ address: string; symbol: string; name: string; decimals: number }>
} = {
  "0x1": [
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6 },
    { address: "0xA0b86a33E6441b8C4505E2E2E5B4B8C4505E2E2E", symbol: "USDC", name: "USD Coin", decimals: 6 },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", name: "Wrapped BTC", decimals: 8 },
    { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  ],
  "0x2105": [
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", name: "USD Coin", decimals: 6 },
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
    { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
  ],
  "0xa4b1": [
    { address: "0xFd086bC7CD5C481DCC95BD0d56f35241523fBab9", symbol: "USDT", name: "Tether USD", decimals: 6 },
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", name: "USD Coin", decimals: 6 },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
    { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  ],
  "0x38": [
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD", decimals: 18 },
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", name: "USD Coin", decimals: 18 },
    { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI", name: "Dai Token", decimals: 18 },
    { address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", symbol: "BTCB", name: "Bitcoin BEP2", decimals: 18 },
    { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "ETH", name: "Ethereum Token", decimals: 18 },
  ],
}

const SESSION_KEY = "wallet_session_v1"
const BALANCES_CACHE_KEY = "wallet_balances_v1"

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [totalUsdBalance, setTotalUsdBalance] = useState<number>(0)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

  const fetchTokenPrices = async (symbols: string[]): Promise<{ [symbol: string]: number }> => {
    try {
      const symbolsParam = symbols.join(",")
      console.log(`[v0] Fetching prices for: ${symbolsParam}`)

      const response = await fetch(`/api/prices?symbols=${symbolsParam}`)

      if (!response.ok) {
        console.log(`[v0] Price API failed with status: ${response.status}`)
        return {}
      }

      const prices = await response.json()
      console.log(`[v0] Received prices:`, prices)
      return prices
    } catch (error) {
      console.error("[v0] Error fetching token prices:", error)
      return {}
    }
  }

  const getTokenBalance = async (tokenAddress: string, walletAddress: string, decimals: number) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        // ERC20 balanceOf function signature
        const data = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`

        const result = await window.ethereum.request({
          method: "eth_call",
          params: [
            {
              to: tokenAddress,
              data: data,
            },
            "latest",
          ],
        })

        if (result && result !== "0x") {
          const balance = Number.parseInt(result, 16) / Math.pow(10, decimals)
          return balance
        }
      }
    } catch (error) {
      console.error(`[v0] Error getting token balance for ${tokenAddress}:`, error)
    }
    return 0
  }

  // === Accurate fetchAllTokenBalances (kept intact) ===
  const fetchAllTokenBalances = async (walletAddress: string, currentChainId: string) => {
    try {
      console.log("[v0] Fetching balances across all supported chains...")
      const allTokenBalances: TokenBalance[] = []

      // iterate using typed keys so TS knows the union type
      const chainKeys = Object.keys(SUPPORTED_CHAINS) as ChainKey[]

      const chainPromises = chainKeys.map(async (cId) => {
        const chainConfig = SUPPORTED_CHAINS[cId]
        try {
          console.log(`[v0] Fetching balances for ${chainConfig.name} (${cId})`)

          let nativeSymbol = "ETH"
          let nativeName = "Ethereum"

          if (cId === "0x38") {
            nativeSymbol = "BNB"
            nativeName = "BNB"
          }

          const nativeBalance = await getBalanceForChain(walletAddress, cId, chainConfig.rpc)
          console.log(`[v0] ${chainConfig.name} ${nativeSymbol} balance: ${nativeBalance}`)

          const nativePrices = await fetchTokenPrices([nativeSymbol])
          const nativePrice = nativePrices[nativeSymbol] || 0
          const nativeUsdValue = Number.parseFloat(nativeBalance) * nativePrice

          if (Number.parseFloat(nativeBalance) > 0) {
            allTokenBalances.push({
              symbol: nativeSymbol,
              name: `${nativeName} (${chainConfig.name})`,
              balance: nativeBalance,
              usdValue: nativeUsdValue,
              price: nativePrice,
              address: "native",
              chain: chainConfig.name,
            })
          }

          try {
            console.log(`[v0] Trying secure API for ${chainConfig.name}...`)
            const response = await fetch(`/api/tokens?address=${walletAddress}&chain=${chainConfig.moralisChain}`)

            if (response.ok) {
              const data = await response.json()
              console.log(`[v0] API response for ${chainConfig.name}:`, data)

              if (data.result && data.result.length > 0) {
                const tokensWithBalance = data.result.filter(
                  (token: any) => token.balance && Number.parseInt(token.balance) > 0,
                )

                if (tokensWithBalance.length > 0) {
                  const symbols = tokensWithBalance.map((token: any) => token.symbol?.toUpperCase()).filter(Boolean)
                  const prices = await fetchTokenPrices(symbols)

                  tokensWithBalance.forEach((token: any) => {
                    const decimals = Number.parseInt(token.decimals) || 18
                    const bal = Number.parseInt(token.balance) / Math.pow(10, decimals)
                    const price = prices[token.symbol?.toUpperCase()] || 0
                    const usdValue = bal * price

                    if (bal > 0.000001) {
                      allTokenBalances.push({
                        symbol: token.symbol || "UNKNOWN",
                        name: `${token.name || "Unknown Token"} (${chainConfig.name})`,
                        balance: bal.toFixed(6),
                        usdValue,
                        price,
                        address: token.token_address,
                        chain: chainConfig.name,
                      })
                    }
                  })
                }
              }
            } else {
              console.log(`[v0] API failed for ${chainConfig.name}, status:`, response.status)
              await fetchPopularTokensForChain(walletAddress, cId, chainConfig, allTokenBalances)
            }
          } catch (apiError) {
            console.log(`[v0] API error for ${chainConfig.name}, using fallback:`, apiError)
            await fetchPopularTokensForChain(walletAddress, cId, chainConfig, allTokenBalances)
          }
        } catch (chainError) {
          console.error(`[v0] Error fetching balances for ${chainConfig.name}:`, chainError)
        }
      })

      await Promise.all(chainPromises)

      const total = allTokenBalances.reduce((sum, token) => sum + token.usdValue, 0)

      setTokenBalances(allTokenBalances)
      setTotalUsdBalance(total)

      // Persist balances cache for instant restore on refresh
      try {
        localStorage.setItem(BALANCES_CACHE_KEY, JSON.stringify({ tokenBalances: allTokenBalances, totalUsdBalance: total }))
      } catch (e) {
        console.warn("[v0] Unable to persist balances cache:", e)
      }

      console.log("[v0] Multi-chain token balances updated:", {
        totalTokens: allTokenBalances.length,
        totalUsdValue: total,
        tokenBalances: allTokenBalances,
      })
    } catch (error) {
      console.error("[v0] Error in fetchAllTokenBalances:", error)
      if (address) {
        const ethBalance = await getBalance(address)
        const ethPrices = await fetchTokenPrices(["ETH"])
        const ethPrice = ethPrices["ETH"] || 0
        const ethUsdValue = Number.parseFloat(ethBalance) * ethPrice

        const fallbackTokens: TokenBalance[] = [
          {
            symbol: "ETH",
            name: "Ethereum",
            balance: ethBalance,
            usdValue: ethUsdValue,
            price: ethPrice,
            address: "native",
            chain: getChainConfig(chainId || "0x1")?.name ?? "Ethereum",
          },
        ]

        setTokenBalances(fallbackTokens)
        setTotalUsdBalance(ethUsdValue)

        try {
          localStorage.setItem(BALANCES_CACHE_KEY, JSON.stringify({ tokenBalances: fallbackTokens, totalUsdBalance: ethUsdValue }))
        } catch (e) {
          console.warn("[v0] Unable to persist fallback balances cache:", e)
        }
      } else {
        setTokenBalances([])
        setTotalUsdBalance(0)
      }
    }
  }

  const getBalanceForChain = async (address: string, chainId: string, rpcUrls: string[]) => {
    for (const rpcUrl of rpcUrls) {
      try {
        console.log(`[v0] Trying RPC: ${rpcUrl} for chain ${chainId}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.log(`[v0] RPC ${rpcUrl} failed with status: ${response.status}`)
          continue
        }

        const data = await response.json()
        if (data.result) {
          const balanceInEth = Number.parseInt(data.result, 16) / Math.pow(10, 18)
          console.log(`[v0] Successfully got balance from ${rpcUrl}: ${balanceInEth.toFixed(4)}`)
          return balanceInEth.toFixed(4)
        } else if (data.error) {
          console.log(`[v0] RPC error from ${rpcUrl}:`, data.error)
          continue
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(`[v0] Error with RPC ${rpcUrl}:`, error.message)
        } else {
          console.log(`[v0] Error with RPC ${rpcUrl}:`, error)
        }
        continue
      }
    }

    console.log(`[v0] All RPC endpoints failed for chain ${chainId}, returning 0`)
    return "0.0000"
  }

  const getTokenBalanceForChain = async (
    tokenAddress: string,
    walletAddress: string,
    decimals: number,
    rpcUrls: string[],
  ) => {
    for (const rpcUrl of rpcUrls) {
      try {
        const data = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: tokenAddress,
                data: data,
              },
              "latest",
            ],
            id: 1,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.log(`[v0] Token balance RPC ${rpcUrl} failed with status: ${response.status}`)
          continue
        }

        const result = await response.json()
        if (result.result && result.result !== "0x") {
          const balance = Number.parseInt(result.result, 16) / Math.pow(10, decimals)
          return balance
        } else if (result.error) {
          console.log(`[v0] Token balance RPC error from ${rpcUrl}:`, result.error)
          continue
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(`[v0] Token balance error with RPC ${rpcUrl}:`, error.message)
        } else {
          console.log(`[v0] Token balance error with RPC ${rpcUrl}:`, error)
        }
        continue
      }
    }

    return 0
  }

  // add refreshBalances utility used by the UI
  const refreshBalances = async () => {
    if (!address) return
    await fetchAllTokenBalances(address, chainId || "")
  }

  const connect = async (walletType?: string) => {
    try {
      setIsConnecting(true)
      setConnectingWallet(walletType || "default")

      if (typeof window !== "undefined") {
        console.log("[v0] Requesting wallet connection...", walletType || "default")

        let ethereum = window.ethereum

        if (walletType === "metamask" && window.ethereum?.isMetaMask) {
          ethereum = window.ethereum
        } else if (walletType === "coinbase" && window.ethereum?.isCoinbaseWallet) {
          ethereum = window.ethereum
        } else if (walletType === "brave" && window.ethereum?.isBraveWallet) {
          ethereum = window.ethereum
        } else if (walletType === "trust" && window.ethereum?.isTrust) {
          ethereum = window.ethereum
        } else if (walletType === "rabby" && window.ethereum?.isRabby) {
          ethereum = window.ethereum
        } else if (walletType === "okx" && window.ethereum?.isOkxWallet) {
          ethereum = window.ethereum
        } else if (walletType === "phantom" && window.solana?.isPhantom) {
          ethereum = window.ethereum
        } else if (!ethereum) {
          throw new Error("No wallet detected. Please install a Web3 wallet.")
        }

        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length > 0) {
          const account = accounts[0]
          setAddress(account)
          setIsConnected(true)

          const cId = await ethereum.request({
            method: "eth_chainId",
          })
          setChainId(cId)

          const bal = await getBalance(account)
          setBalance(bal)

          await fetchAllTokenBalances(account, cId)

          // persist session
          try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ address: account, chainId: cId }))
          } catch (e) {
            console.warn("[v0] Unable to persist wallet session:", e)
          }

          console.log("[v0] Wallet connected:", { account, cId, bal })
        }
      }
    } catch (error) {
      console.error("[v0] Connection error:", error)
      throw error
    } finally {
      setIsConnecting(false)
      setConnectingWallet(null)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setChainId(null)
    setBalance(null)
    setTotalUsdBalance(0)
    setTokenBalances([])
    setIsConnected(false)
    setIsConnecting(false)
    setConnectingWallet(null)
    try {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(BALANCES_CACHE_KEY)
    } catch (e) {
      console.warn("[v0] Unable to clear wallet session or balances cache:", e)
    }
    console.log("[v0] Wallet disconnected")
  }

  const switchNetwork = async (targetChainId: string) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        })
      }
    } catch (error) {
      console.error("[v0] Network switch error:", error)
    }
  }

  const getBalance = async (address: string) => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
        const balanceInEth = Number.parseInt(balance, 16) / Math.pow(10, 18)
        return balanceInEth.toFixed(4)
      }
    } catch (error) {
      console.error("[v0] Error getting balance:", error)
    }
    return "0.0000"
  }

  useEffect(() => {
    // Restore persisted session on mount (if present) — rehydrate balances cache then refresh
    const restoreSession = async () => {
      if (typeof window === "undefined") return

      try {
        const raw = localStorage.getItem(SESSION_KEY)
        if (!raw) return

        const parsed = JSON.parse(raw)
        if (!parsed?.address) return

        console.log("[v0] Found stored wallet session:", parsed)

        // Immediately rehydrate cached balances (instant UI) if available
        try {
          const cached = localStorage.getItem(BALANCES_CACHE_KEY)
          if (cached) {
            const parsedCache = JSON.parse(cached)
            if (parsedCache?.tokenBalances) {
              setTokenBalances(parsedCache.tokenBalances)
            }
            if (typeof parsedCache?.totalUsdBalance === "number") {
              setTotalUsdBalance(parsedCache.totalUsdBalance)
            }
            console.log("[v0] Rehydrated cached balances from storage")
          }
        } catch (e) {
          console.warn("[v0] Failed to parse balances cache:", e)
        }

        // Attempt to confirm provider still has the account (best-effort)
        let providerHasAccount = false
        try {
          if (window.ethereum && typeof window.ethereum.request === "function") {
            const accounts: string[] = await window.ethereum.request({ method: "eth_accounts" })
            if (Array.isArray(accounts) && accounts.length > 0) {
              providerHasAccount = accounts.includes(parsed.address)
            }
          }
        } catch (e) {
          console.warn("[v0] eth_accounts check failed:", e)
        }

        // Set basic state from storage (UI already shows balances from cache), but still refresh balances
        setAddress(parsed.address)
        setChainId(parsed.chainId || null)

        // fetch fresh balances (this will overwrite cached values when complete)
        try {
          await fetchAllTokenBalances(parsed.address, parsed.chainId || "")
        } catch (e) {
          console.warn("[v0] fetchAllTokenBalances during restore failed:", e)
        }

        try {
          if (providerHasAccount && window.ethereum) {
            const bal = await getBalance(parsed.address)
            setBalance(bal)
          } else {
            const bal = await getBalance(parsed.address).catch(() => "0.0000")
            setBalance(bal)
          }
        } catch (e) {
          console.warn("[v0] error restoring native balance:", e)
        }

        setIsConnected(true)
        console.log("[v0] Restored wallet session and balances for", parsed.address)
      } catch (e) {
        console.warn("[v0] Failed to parse stored wallet session:", e)
      }
    }

    restoreSession()

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAddress(accounts[0])
          getBalance(accounts[0]).then(setBalance)
          if (chainId) {
            fetchAllTokenBalances(accounts[0], chainId)
          }
          try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ address: accounts[0], chainId }))
          } catch (e) {
            console.warn("[v0] Unable to persist wallet session on accountsChanged:", e)
          }
        }
      }

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId)
        if (address) {
          getBalance(address).then(setBalance)
          fetchAllTokenBalances(address, newChainId)
        }
        try {
          if (address) {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ address, chainId: newChainId }))
          }
        } catch (e) {
          console.warn("[v0] Unable to persist wallet session on chainChanged:", e)
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [address, chainId])

  const detectWallets = () => {
    const detectedWallets: Array<{ id: string; name: string; provider: any }> = []

    if (typeof window !== "undefined" && window.ethereum) {
      if (window.ethereum.isMetaMask) {
        detectedWallets.push({ id: "metamask", name: "MetaMask", provider: window.ethereum })
      }

      if (window.ethereum.isCoinbaseWallet) {
        detectedWallets.push({ id: "coinbase", name: "Coinbase Wallet", provider: window.ethereum })
      }

      if (window.ethereum.isBraveWallet) {
        detectedWallets.push({ id: "brave", name: "Brave Wallet", provider: window.ethereum })
      }

      if (window.ethereum.isTrust) {
        detectedWallets.push({ id: "trust", name: "Trust Wallet", provider: window.ethereum })
      }

      if (window.ethereum.isRabby) {
        detectedWallets.push({ id: "rabby", name: "Rabby Wallet", provider: window.ethereum })
      }

      if (window.ethereum.isOkxWallet) {
        detectedWallets.push({ id: "okx", name: "OKX Wallet", provider: window.ethereum })
      }

      if (window.solana && window.solana.isPhantom) {
        detectedWallets.push({ id: "phantom", name: "Phantom", provider: window.solana })
      }

      if (detectedWallets.length === 0 && window.ethereum) {
        detectedWallets.push({ id: "injected", name: "Injected Wallet", provider: window.ethereum })
      }
    }

    return detectedWallets
  }

  const fetchPopularTokensForChain = async (
    walletAddress: string,
    chainIdParam: ChainKey,
    chainConfig: { name: string; rpc: string[]; moralisChain: string },
    allTokenBalances: TokenBalance[],
  ) => {
    const tokens = POPULAR_TOKENS[chainIdParam] || []

    const tokenPromises = tokens.map(async (token) => {
      const balance = await getTokenBalanceForChain(token.address, walletAddress, token.decimals, chainConfig.rpc)
      return {
        ...token,
        balance: balance.toFixed(6),
        rawBalance: balance,
      }
    })

    const tokenResults = await Promise.all(tokenPromises)
    const tokensWithBalance = tokenResults.filter((token) => token.rawBalance > 0)

    if (tokensWithBalance.length > 0) {
      const symbolsForPrice = tokensWithBalance.map((token) => token.symbol.toUpperCase())
      const prices = await fetchTokenPrices(symbolsForPrice)

      tokensWithBalance.forEach((token) => {
        const price = prices[token.symbol.toUpperCase()] || 0
        const usdValue = token.rawBalance * price

        allTokenBalances.push({
          symbol: token.symbol,
          name: `${token.name} (${chainConfig.name})`,
          balance: token.balance,
          usdValue,
          price,
          address: token.address,
          chain: chainConfig.name,
        })
      })
    }
  }

  const value: WalletContextType = {
    address,
    isConnected,
    chainId,
    balance,
    totalUsdBalance,
    tokenBalances,
    isConnecting,
    connectingWallet,
    connect,
    disconnect,
    switchNetwork,
    detectWallets,
    refreshBalances,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

declare global {
  interface Window {
    ethereum?: any
    solana?: any
  }
}
