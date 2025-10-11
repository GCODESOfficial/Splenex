/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useLiFi } from "@/hooks/use-lifi"
import { TokenIcon } from "./TokenIcon"

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
  id: 99998,
  name: "Solana",
  icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
},
{
  id: 99999,
  name: "Cosmos",
  icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/info/logo.png",
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
  const [showChains, setShowChains] = useState(false);


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

  // Helper function to map chain name to chainId
  const getChainIdFromName = (chainName: string): number => {
    const chainMap: { [key: string]: number } = {
      "Ethereum": 1,
      "Base": 8453,
      "Arbitrum": 42161,
      "BSC": 56,
      "Polygon": 137,
      "Optimism": 10,
      "Avalanche": 43114,
      "Fantom": 250,
    };
    return chainMap[chainName] || 1;
  };

  // Helper to get correct decimals based on token symbol and chain
  const getTokenDecimals = (symbol: string, chainId: number): number => {
    // USDT decimals vary by chain
    if (symbol === "USDT") {
      return [1, 42161, 137].includes(chainId) ? 6 : 18; // Eth, Arbitrum, Polygon use 6, BSC uses 18
    }
    // USDC always uses 6
    if (symbol === "USDC") return 6;
    // WBTC uses 8
    if (symbol === "WBTC") return 8;
    // Most tokens use 18
    return 18;
  };

  const allTokens = [
    // User's actual token balances first
    ...tokenBalances.map((balance) => {
      // Extract chain name from balance.name (e.g., "Tether USD (BSC)" -> "BSC")
      const chainName = balance.chain || (balance.name.includes("(") ? balance.name.split("(")[1].replace(")", "") : "Ethereum");
      const chainId = getChainIdFromName(chainName);
      const decimals = getTokenDecimals(balance.symbol, chainId);
      
      return {
        symbol: balance.symbol,
        name: balance.name,
        address: balance.address === "native" ? "0x0000000000000000000000000000000000000000" : balance.address,
        chainId: chainId,
        chainName: chainName,
        balance: balance.balance,
        usdValue: `$${balance.usdValue.toFixed(2)}`,
        decimals: decimals,
      };
    }),
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
    console.log("[v0] Token selected:", {
      symbol: token.symbol,
      address: token.address,
      chainId: token.chainId,
      chainName: token.chainName,
      decimals: token.decimals,
    });
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

    
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-11/12 rounded-none bg-black border-none p-0">
        <div className="hidden md:flex gap-14 w-full h-full overflow-y-auto">
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
      <div className="w-8 h-8 rounded-full flex items-center justify-center relative">
       <span className="flex items-center relative w-5 h-5">
  <img
    src={
      token.chainName?.toLowerCase().includes("solana")
        ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${token.address}/logo.png`
        : token.chainName?.toLowerCase().includes("cosmos")
        ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/assets/${token.address}/logo.png`
        : token.address === "0x0000000000000000000000000000000000000000"
        ? CHAINS.find((c) => c.id === token.chainId)?.icon
        : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${(() => {
            switch (token.chainId) {
              case 1:
                return "ethereum"
              case 56:
                return "smartchain"
              case 137:
                return "polygon"
              case 42161:
                return "arbitrum"
              case 10:
                return "optimism"
              case 43114:
                return "avalanchec"
              case 8453:
                return "base"
              case 324:
                return "zksync"
              case 59144:
                return "linea"
              default:
                return "ethereum"
            }
          })()}/assets/${token.address}/logo.png`
    }
    alt={token.symbol}
    className="w-full h-full rounded-full"
    onError={(e) => {
      // hide if no image found
      e.currentTarget.style.display = "none";
    }}
  />

  {/* Optional L2 badge for EVM */}
  {token.chainId && (
    <>
      {String(token.chainId) === "137" && (
        <img
          src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png"
          alt="Polygon"
          className="absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full border border-black"
        />
      )}
      {String(token.chainId) === "42161" && (
        <img
          src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png"
          alt="Arbitrum"
          className="absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full border border-black"
        />
      )}
      {String(token.chainId) === "56" && (
        <img
          src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png"
          alt="BSC"
          className="absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full border border-black"
        />
      )}
      {String(token.chainId) === "8453" && (
        <img
          src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png"
          alt="Base"
          className="absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 rounded-full border border-black"
        />
      )}
    </>
  )}
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

            </div>
          </div>
        </div>



   {/* --- Mobile Layout --- */}
<div className="flex flex-col md:hidden h-[90vh] w-full bg-[#0A0A0A]">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
    <DialogTitle className="text-white text-base font-semibold">
      Select Token
    </DialogTitle>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-white text-lg font-light"
    >
      ✕
    </button>
  </div>

  {/* Search + Chain selector */}
  <div className="p-4 border-b border-gray-800">
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Search for a token or paste address"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 bg-[#1A1A1A] border-none text-white rounded-md"
      />
    </div>

    {/* Chain dropdown toggle */}
    <button
      onClick={() => setShowChains((prev) => !prev)}
      className="flex items-center justify-between w-full px-3 py-2 bg-[#1A1A1A] rounded-md text-sm text-gray-300"
    >
      <div className="flex items-center gap-2">
        <img
          src={
            selectedChain
              ? CHAINS.find((c) => c.id === selectedChain)?.icon
              : "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
          }
          alt="chain"
          className="w-4 h-4"
        />
        <span>
          {selectedChain
            ? CHAINS.find((c) => c.id === selectedChain)?.name
            : "All Chains"}
        </span>
      </div>
      <ChevronDown
        className={`h-4 w-4 text-gray-400 transition-transform ${
          showChains ? "rotate-180" : "rotate-0"
        }`}
      />
    </button>

    {/* Chain dropdown list */}
    {showChains && (
      <div className="mt-3 max-h-[220px] overflow-y-auto bg-[#111111] rounded-md border border-gray-800">
        <button
          onClick={() => {
            setSelectedChain(null);
            setShowChains(false);
          }}
          className={`flex items-center w-full px-4 py-2 text-sm ${
            selectedChain === null
              ? "bg-yellow-400 text-black"
              : "text-gray-200 hover:bg-[#1E1E1E]"
          }`}
        >
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-xs">
              🌐
            </div>
            All Chains
          </span>
        </button>

        {filteredChains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => {
              setSelectedChain(chain.id);
              setShowChains(false);
            }}
            className={`flex items-center w-full px-4 py-2 text-sm ${
              selectedChain === chain.id
                ? "bg-yellow-400 text-black"
                : "text-gray-200 hover:bg-[#1E1E1E]"
            }`}
          >
            <img
              src={chain.icon}
              alt={chain.name}
              className="w-4 h-4 mr-2 rounded-full"
            />
            {chain.name}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Tokens list */}
  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
    <div className="text-gray-400 text-sm mb-2">
      {selectedChain
        ? `${CHAINS.find((c) => c.id === selectedChain)?.name} Tokens`
        : "Your Tokens"}
    </div>

    {filteredTokens.map((token, index) => (
      <div
        key={`${token.symbol}-${index}`}
        className="flex items-center justify-between p-3 hover:bg-[#141414] rounded-lg cursor-pointer"
        onClick={() => handleTokenSelect(token)}
      >
        <div className="flex items-center space-x-3">
          {/* Token icon */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <img
               src={
    "logoURI" in token && token.logoURI
      ? token.logoURI
      : CHAINS.find((c) => c.id === token.chainId)?.icon ||
        "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
  }
              alt={token.symbol}
              className="w-full h-full rounded-full"
            />
            {token.chainId && (
              <img
                src={
                  CHAINS.find((c) => c.id === token.chainId)?.icon ||
                  "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
                }
                alt={token.chainName}
                className="absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border border-black"
              />
            )}
          </div>

          {/* Token Info */}
          <div>
            <div className="text-white font-medium text-sm">{token.symbol}</div>
            <div className="text-gray-500 text-xs">
              {token.chainName} {token.address && "·"}{" "}
              {token.address
                ? `${token.address.slice(0, 6)}...${token.address.slice(-4)}`
                : ""}
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="text-right">
          <div className="text-white text-sm font-semibold">
            {token.usdValue || "$0.00"}
          </div>
          <div className="text-gray-500 text-xs">
            {token.balance || "0.0000"}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

      </DialogContent>
    </Dialog>
  )
}
