/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, createContext, useContext } from "react"

interface TokenBalance {
  symbol: string
  name: string
  balance: string
  usdValue: number
  price: number
  address: string
  chain?: string
}

interface SecondaryWalletContextType {
  secondaryAddress: string | null
  secondaryChainId: string | null
  secondaryWalletType: string | null
  isSecondaryConnected: boolean
  isSecondaryConnecting: boolean
  secondaryTokenBalances: TokenBalance[]
  secondaryTotalUsdBalance: number
  connectSecondaryWallet: (walletType?: string, providerOverride?: any) => Promise<void>
  disconnectSecondary: () => void
  setSecondaryAddress: (address: string) => void
  refreshSecondaryBalances: () => Promise<void>
}

const SecondaryWalletContext = createContext<SecondaryWalletContextType | null>(null)

const SECONDARY_SESSION_KEY = "secondary_wallet_session_v1"
const SECONDARY_BALANCES_CACHE_KEY = "secondary_wallet_balances_v1"

// Detect wallet from provider (similar to main wallet but independent)
const detectSecondaryWallet = (provider: any): string | null => {
  if (!provider) return null
  
  if (provider.isRabby) return "rabby"
  if (provider.isBraveWallet && !provider.isMetaMask) return "brave"
  if (provider.isCoinbaseWallet || provider.isCoinbaseBrowser) return "coinbase"
  if (provider.isOkxWallet) return "okx"
  if (provider.isTrust) return "trust"
  if (provider.isZerion) return "zerion"
  if (provider.isMetaMask && !provider.isRabby) return "metamask"
  if (provider.isPhantom) return "phantom"
  
  return "injected"
}

export function SecondaryWalletProvider({ children }: { children: React.ReactNode }) {
  const [secondaryAddress, setSecondaryAddress] = useState<string | null>(null)
  const [secondaryChainId, setSecondaryChainId] = useState<string | null>(null)
  const [secondaryWalletType, setSecondaryWalletType] = useState<string | null>(null)
  const [isSecondaryConnected, setIsSecondaryConnected] = useState(false)
  const [isSecondaryConnecting, setIsSecondaryConnecting] = useState(false)
  const [secondaryTokenBalances, setSecondaryTokenBalances] = useState<TokenBalance[]>([])
  const [secondaryTotalUsdBalance, setSecondaryTotalUsdBalance] = useState<number>(0)

  // Fetch token balances for secondary wallet (using same API as primary wallet)
  const fetchSecondaryBalances = async (walletAddress: string) => {
    try {
      console.log("[SecondaryWallet] 📊 Fetching balances for:", walletAddress)
      
      // Call the same API endpoint that primary wallet uses
      const response = await fetch(`/api/tokens?address=${walletAddress}&chain=eth`)
      
      if (!response.ok) {
        console.warn("[SecondaryWallet] ⚠️ Balance fetch failed:", response.status)
        return
      }

      const data = await response.json()
      
      if (data.result && data.result.length > 0) {
        const tokenBalances: TokenBalance[] = data.result.map((token: any) => ({
          symbol: token.symbol || "UNKNOWN",
          name: token.name || "Unknown Token",
          balance: (Number.parseInt(token.balance) / Math.pow(10, Number.parseInt(token.decimals) || 18)).toFixed(6),
          usdValue: 0, // We can fetch prices separately if needed
          price: 0,
          address: token.token_address,
          chain: "Ethereum",
        }))

        const totalUsd = tokenBalances.reduce((sum, token) => sum + token.usdValue, 0)
        
        setSecondaryTokenBalances(tokenBalances)
        setSecondaryTotalUsdBalance(totalUsd)

        // Cache balances
        try {
          localStorage.setItem(SECONDARY_BALANCES_CACHE_KEY, JSON.stringify({ 
            tokenBalances, 
            totalUsdBalance: totalUsd 
          }))
        } catch (e) {
          console.warn("[SecondaryWallet] Unable to cache balances:", e)
        }

        console.log("[SecondaryWallet] ✅ Balances updated:", tokenBalances.length, "tokens")
      }
    } catch (error) {
      console.error("[SecondaryWallet] ❌ Error fetching balances:", error)
    }
  }

  const refreshSecondaryBalances = async () => {
    if (secondaryAddress) {
      await fetchSecondaryBalances(secondaryAddress)
    }
  }

  const connectSecondaryWallet = async (walletType?: string, providerOverride?: any) => {
    try {
      setIsSecondaryConnecting(true)
      console.log("[SecondaryWallet] 🔗 Connecting secondary wallet:", walletType || "default")

      if (typeof window === "undefined") {
        throw new Error("Window not available")
      }

      let ethereum = providerOverride || window.ethereum

      // If no provider override, find the specific provider
      if (!providerOverride) {
        // Handle multiple wallet providers
        if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
          console.log("[SecondaryWallet] Multiple providers detected:", window.ethereum.providers.length)
          
          if (walletType === "metamask") {
            const metamaskProvider = window.ethereum.providers.find((p: any) => {
              return p.isMetaMask === true && p.isRabby !== true
            })
            ethereum = metamaskProvider || window.ethereum
          } else if (walletType === "rabby") {
            const rabbyProvider = window.ethereum.providers.find((p: any) => p.isRabby === true)
            ethereum = rabbyProvider || window.ethereum
          } else if (walletType === "coinbase") {
            ethereum = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet) || window.ethereum
          } else if (walletType === "brave") {
            ethereum = window.ethereum.providers.find((p: any) => p.isBraveWallet) || window.ethereum
          } else if (walletType === "trust") {
            ethereum = window.ethereum.providers.find((p: any) => p.isTrust) || window.ethereum
          } else if (walletType === "okx") {
            ethereum = window.ethereum.providers.find((p: any) => p.isOkxWallet) || window.ethereum
          } else if (walletType === "zerion") {
            ethereum = window.ethereum.providers.find((p: any) => p.isZerion) || window.ethereum
          }
        }
      }

      if (!ethereum) {
        throw new Error("No wallet detected. Please install a Web3 wallet.")
      }

      console.log("[SecondaryWallet] Using provider:", {
        walletType,
        isMetaMask: ethereum.isMetaMask,
        isRabby: ethereum.isRabby,
        isCoinbase: ethereum.isCoinbaseWallet,
        isBrave: ethereum.isBraveWallet,
      })

      // Request accounts from the wallet
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const account = accounts[0]
        setSecondaryAddress(account)
        setIsSecondaryConnected(true)

        // Get chain ID
        const cId = await ethereum.request({
          method: "eth_chainId",
        })
        setSecondaryChainId(cId)

        // Detect actual wallet type from provider
        const detectedWallet = detectSecondaryWallet(ethereum)
        setSecondaryWalletType(detectedWallet)

        // Persist session
        try {
          localStorage.setItem(
            SECONDARY_SESSION_KEY,
            JSON.stringify({ address: account, chainId: cId, walletType: detectedWallet })
          )
        } catch (e) {
          console.warn("[SecondaryWallet] Unable to persist session:", e)
        }

        console.log("[SecondaryWallet] ✅ Connected:", { account, cId, wallet: detectedWallet })

        // Fetch balances for the connected wallet
        await fetchSecondaryBalances(account)
      }
    } catch (error) {
      console.error("[SecondaryWallet] ❌ Connection error:", error)
      throw error
    } finally {
      setIsSecondaryConnecting(false)
    }
  }

  const disconnectSecondary = () => {
    setSecondaryAddress(null)
    setSecondaryChainId(null)
    setSecondaryWalletType(null)
    setIsSecondaryConnected(false)
    setIsSecondaryConnecting(false)
    setSecondaryTokenBalances([])
    setSecondaryTotalUsdBalance(0)
    
    try {
      localStorage.removeItem(SECONDARY_SESSION_KEY)
      localStorage.removeItem(SECONDARY_BALANCES_CACHE_KEY)
    } catch (e) {
      console.warn("[SecondaryWallet] Unable to clear session:", e)
    }
    
    console.log("[SecondaryWallet] 🔌 Disconnected")
  }

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (typeof window === "undefined") return

      try {
        const raw = localStorage.getItem(SECONDARY_SESSION_KEY)
        if (!raw) return

        const parsed = JSON.parse(raw)
        if (!parsed?.address) return

        console.log("[SecondaryWallet] 🚀 FAST restore: Restoring session:", parsed)

        // ✅ IMMEDIATELY set connected state for instant UX
        setSecondaryAddress(parsed.address)
        setSecondaryChainId(parsed.chainId || null)
        setSecondaryWalletType(parsed.walletType || null)
        setIsSecondaryConnected(true)

        // Restore cached balances immediately
        try {
          const cachedBalances = localStorage.getItem(SECONDARY_BALANCES_CACHE_KEY)
          if (cachedBalances) {
            const { tokenBalances, totalUsdBalance } = JSON.parse(cachedBalances)
            setSecondaryTokenBalances(tokenBalances || [])
            setSecondaryTotalUsdBalance(totalUsdBalance || 0)
            console.log("[SecondaryWallet] ⚡ Cached balances restored instantly")
          }
        } catch (e) {
          console.warn("[SecondaryWallet] Failed to restore cached balances:", e)
        }

        console.log("[SecondaryWallet] ✅ INSTANT reconnection complete:", parsed.address)

        // Background refresh (non-blocking) - fetch fresh data in background
        fetchSecondaryBalances(parsed.address).catch(e => 
          console.warn("[SecondaryWallet] Background balance refresh failed:", e)
        )
      } catch (e) {
        console.warn("[SecondaryWallet] Failed to parse stored session:", e)
      }
    }

    restoreSession()
  }, [])

  const value: SecondaryWalletContextType = {
    secondaryAddress,
    secondaryChainId,
    secondaryWalletType,
    isSecondaryConnected,
    isSecondaryConnecting,
    secondaryTokenBalances,
    secondaryTotalUsdBalance,
    connectSecondaryWallet,
    disconnectSecondary,
    setSecondaryAddress,
    refreshSecondaryBalances,
  }

  return <SecondaryWalletContext.Provider value={value}>{children}</SecondaryWalletContext.Provider>
}

export function useSecondaryWallet() {
  const context = useContext(SecondaryWalletContext)
  if (!context) {
    throw new Error("useSecondaryWallet must be used within a SecondaryWalletProvider")
  }
  return context
}

