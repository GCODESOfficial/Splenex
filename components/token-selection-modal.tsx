/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useLiFi } from "@/hooks/use-lifi"

interface Token {
  symbol: string
  name: string
  address: string
  chainId: number
  chainName: string
  balance?: string
  usdValue?: string
  icon?: string
  logoURI?: string
  decimals?: number
}

interface Chain {
  id: number
  name: string
  icon: string
}

const CHAINS: Chain[] = [
  {
    id: 1,
    name: "Ethereum",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
  },
  {
    id: 8453,
    name: "Base",
    icon: "https://raw.githubusercontent.com/base-org/brand-kit/main/logo/in-product/Base_Network_Logo.svg",
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",
  },
  {
    id: 56,
    name: "BSC",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
  },
  {
    id: 137,
    name: "Polygon",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
  },
  {
    id: 10,
    name: "Optimism",
    icon: "https://raw.githubusercontent.com/ethereum-optimism/brand-kit/main/assets/svg/OPTIMISM-R.svg",
  },
  {
    id: 43114,
    name: "Avalanche",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
  },
  {
    id: 250,
    name: "Fantom",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png",
  },
  {
    id: 1285,
    name: "Moonriver",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/moonriver/info/logo.png",
  },
  {
    id: 25,
    name: "Cronos",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cronos/info/logo.png",
  },
  {
    id: 1666600000,
    name: "Harmony",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/harmony/info/logo.png",
  },
  {
    id: 66,
    name: "OKExChain",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/okexchain/info/logo.png",
  },
  {
    id: 128,
    name: "HECO",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/heco/info/logo.png",
  },
  {
    id: 321,
    name: "KCC",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/kcc/info/logo.png",
  },
  {
    id: 1088,
    name: "Metis",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/metis/info/logo.png",
  },
  {
    id: 42220,
    name: "Celo",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png",
  },
  {
    id: 1313161554,
    name: "Aurora",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aurora/info/logo.png",
  },
  {
    id: 2000,
    name: "Dogechain",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/dogechain/info/logo.png",
  },
  {
    id: 199,
    name: "BitTorrent",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bittorrent/info/logo.png",
  },
  {
    id: 1284,
    name: "Moonbeam",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/moonbeam/info/logo.png",
  },
  {
    id: 122,
    name: "Fuse",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fuse/info/logo.png",
  },
  {
    id: 1101,
    name: "Polygon zkEVM",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygonzkevm/info/logo.png",
  },
  {
    id: 324,
    name: "zkSync Era",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/zksync/info/logo.png",
  },
  {
    id: 59144,
    name: "Linea",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png",
  },
  {
    id: 5000,
    name: "Mantle",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/mantle/info/logo.png",
  },
]

const POPULAR_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    chainId: 1,
    chainName: "Ethereum",
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: 1,
    chainName: "Ethereum",
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    chainId: 1,
    chainName: "Ethereum",
    decimals: 6,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    chainId: 1,
    chainName: "Ethereum",
    decimals: 8,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    chainId: 1,
    chainName: "Ethereum",
    decimals: 18,
  },
  // Base tokens
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    chainId: 8453,
    chainName: "Base",
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    chainId: 8453,
    chainName: "Base",
    decimals: 6,
  },
  // Arbitrum tokens
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    chainId: 42161,
    chainName: "Arbitrum",
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    chainId: 42161,
    chainName: "Arbitrum",
    decimals: 6,
  },
  // BSC tokens
  {
    symbol: "BNB",
    name: "Binance Coin",
    address: "0x0000000000000000000000000000000000000000",
    chainId: 56,
    chainName: "BSC",
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x55d398326f99059fF775485246999027B3197955",
    chainId: 56,
    chainName: "BSC",
    decimals: 18,
  },
  // Polygon tokens
  {
    symbol: "MATIC",
    name: "Polygon",
    address: "0x0000000000000000000000000000000000000000",
    chainId: 137,
    chainName: "Polygon",
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    chainId: 137,
    chainName: "Polygon",
    decimals: 6,
  },
]

interface TokenSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (token: Token) => void
  selectedToken?: Token
}

export function TokenSelectionModal({ isOpen, onClose, onSelectToken, selectedToken }: TokenSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [chainSearchQuery, setChainSearchQuery] = useState("")
  const [selectedChain, setSelectedChain] = useState<number | null>(null)
  const [lifiTokens, setLifiTokens] = useState<Token[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)

  const { tokenBalances } = useWallet()
  const { getSupportedTokens, getSupportedChains } = useLiFi()

  useEffect(() => {
    const loadLiFiTokens = async () => {
      if (selectedChain) {
        setIsLoadingTokens(true)
        try {
          const tokens = await getSupportedTokens(selectedChain)
          console.log(`[v0] LiFi tokens for chain ${selectedChain}:`, tokens)

          // Convert LiFi token format to our Token interface
          const formattedTokens: Token[] = tokens.map((token: any) => ({
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            chainId: token.chainId,
            chainName: CHAINS.find((c) => c.id === token.chainId)?.name || `Chain ${token.chainId}`,
            decimals: token.decimals,
            logoURI: token.logoURI,
          }))

          setLifiTokens(formattedTokens)
        } catch (error) {
          console.error("[v0] Failed to load LiFi tokens:", error)
          setLifiTokens([])
        } finally {
          setIsLoadingTokens(false)
        }
      } else {
        setLifiTokens([])
      }
    }

    loadLiFiTokens()
  }, [selectedChain, getSupportedTokens])

  const filteredChains = CHAINS.filter((chain) => chain.name.toLowerCase().includes(chainSearchQuery.toLowerCase()))

  const allTokens = [
    // User's actual token balances first
    ...tokenBalances.map((balance) => ({
      symbol: balance.symbol,
      name: balance.name,
      address: balance.address === "native" ? "0x0000000000000000000000000000000000000000" : balance.address,
      chainId: 1, // Default to Ethereum, could be enhanced to detect actual chain
      chainName: balance.name.includes("(") ? balance.name.split("(")[1].replace(")", "") : "Ethereum",
      balance: balance.balance,
      usdValue: `$${balance.usdValue.toFixed(2)}`,
      decimals: 18,
    })),
    // LiFi supported tokens for selected chain
    ...lifiTokens,
    // Popular tokens as fallback
    ...POPULAR_TOKENS,
  ]

  const filteredTokens = allTokens.filter((token, index, self) => {
    // Remove duplicates based on symbol + chainId
    const isDuplicate = self.findIndex((t) => t.symbol === token.symbol && t.chainId === token.chainId) !== index
    if (isDuplicate) return false

    const matchesSearch =
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChain = selectedChain === null || token.chainId === selectedChain
    return matchesSearch && matchesChain
  })

  const handleTokenSelect = (token: Token) => {
    onSelectToken(token)
    onClose()
  }

  const getTokenIcon = (token: Token) => {
    if (token.logoURI) {
      return (
        <img
          src={token.logoURI || "/placeholder.svg"}
          alt={token.symbol}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            // Fallback to text icon if image fails to load
            e.currentTarget.style.display = "none"
            e.currentTarget.nextElementSibling?.classList.remove("hidden")
          }}
        />
      )
    }

    return (
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">
          {token.symbol === "ETH"
            ? "Ξ"
            : token.symbol === "BNB"
              ? "B"
              : token.symbol === "MATIC"
                ? "M"
                : token.symbol.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-11/12 rounded-none bg-black border-none p-0">
        <div className="flex gap-14 w-full h-full overflow-y-auto">
          {/* Left Sidebar - Chains */}
          <div className="w-64 border-2 border-yellow-400 p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search Chains"
                  value={chainSearchQuery}
                  onChange={(e) => setChainSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant={selectedChain === null ? "default" : "ghost"}
                className={`w-full justify-start text-left ${
                  selectedChain === null
                    ? "bg-yellow-400 text-black hover:bg-yellow-500"
                    : "text-white hover:bg-gray-800"
                }`}
                onClick={() => setSelectedChain(null)}
              >
                <div className="w-5 h-5 mr-2 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🌐</span>
                </div>
                All Chains
              </Button>

              <div className="text-sm text-gray-400 font-medium mb-2">Popular Chains</div>

              {filteredChains.slice(0, 15).map((chain) => (
                <Button
                  key={chain.id}
                  variant={selectedChain === chain.id ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    selectedChain === chain.id
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "text-white hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedChain(chain.id)}
                >
                  <img
                    src={chain.icon || "/placeholder.svg"}
                    alt={chain.name}
                    className="w-5 h-5 mr-2 rounded-full"
                    onError={(e) => {
                      // Fallback to colored circle if image fails
                      e.currentTarget.style.display = "none"
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                  <div className="w-5 h-5 mr-2 bg-blue-500 rounded-full items-center justify-center text-white text-xs font-bold hidden">
                    {chain.name.charAt(0)}
                  </div>
                  {chain.name}
                </Button>
              ))}

              <div className="text-sm text-gray-400 font-medium mb-2 mt-4">Chains A-Z</div>

              {filteredChains.slice(15).map((chain) => (
                <Button
                  key={chain.id}
                  variant={selectedChain === chain.id ? "default" : "ghost"}
                  className={`w-full justify-start text-left ${
                    selectedChain === chain.id
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "text-white hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedChain(chain.id)}
                >
                  <img
                    src={chain.icon || "/placeholder.svg"}
                    alt={chain.name}
                    className="w-5 h-5 mr-2 rounded-full"
                    onError={(e) => {
                      // Fallback to colored circle if image fails
                      e.currentTarget.style.display = "none"
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                  <div className="w-5 h-5 mr-2 bg-blue-500 rounded-full items-center justify-center text-white text-xs font-bold hidden">
                    {chain.name.charAt(0)}
                  </div>
                  {chain.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Side - Tokens */}
          <div className="flex-1 w-full p-4 border-2 border-yellow-400 overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-white text-lg">Select Token</DialogTitle>
            </DialogHeader>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for a token or paste address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>

            {isLoadingTokens && selectedChain && (
              <div className="text-center text-gray-400 py-4">
                Loading tokens for {CHAINS.find((c) => c.id === selectedChain)?.name}...
              </div>
            )}

            <div className="text-sm text-gray-400 font-medium mb-3">
              {selectedChain ? `${CHAINS.find((c) => c.id === selectedChain)?.name} Tokens` : "All Tokens"}
            </div>

            <div className="space-y-2 max-h-[400px]">
              {filteredTokens.map((token, index) => (
                <div
                  key={`${token.symbol}-${token.chainId}-${index}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-900 rounded-lg cursor-pointer border border-transparent hover:border-gray-700"
                  onClick={() => handleTokenSelect(token)}
                >
                  <div className="flex items-center space-x-3">
                    {getTokenIcon(token)}
                    <div className=" w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {token.symbol === "ETH" ? "Ξ" : token.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{token.symbol}</div>
                      <div className="text-gray-400 text-sm">
                        {token.chainName} • {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{token.usdValue || "$0.00"}</div>
                    <div className="text-gray-400 text-sm">{token.balance || "0"}</div>
                  </div>
                </div>
              ))}

              {filteredTokens.length === 0 && !isLoadingTokens && (
                <div className="text-center text-gray-400 py-8">No tokens found matching your search.</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
