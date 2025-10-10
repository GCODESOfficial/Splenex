"use client"

import { useWallet } from "@/hooks/use-wallet"
import { ChevronDown, Copy, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CHAIN_NAMES: { [key: string]: string } = {
  "0x1": "Ethereum",
  "0x89": "Polygon",
  "0xa4b1": "Arbitrum",
  "0xa": "Optimism",
}

export function WalletDropdown() {
  const { address, disconnect, balance, chainId } = useWallet()

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      console.log("[v0] Address copied")
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="md:bg-[#121212] md:p-2 px-1 md:px-2 text-white">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{address ? formatAddress(address) : "Wallet"}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 mx-auto  bg-[#121212] border border-[#FCD404] rounded-none">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-white">Wallet</span>
          </div>

          <div className="text-xs text-gray-400 font-mono">{address && formatAddress(address)}</div>

          {balance && <div className="text-sm text-white mt-1">{balance} ETH</div>}

          {chainId && <div className="text-xs text-gray-400 mt-1">Network: {CHAIN_NAMES[chainId] || "Unknown"}</div>}
        </div>

        <DropdownMenuItem onClick={copyAddress} className="text-white hover:bg-gray-800">
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem onClick={disconnect} className="text-red-400 hover:bg-red-900/20">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
