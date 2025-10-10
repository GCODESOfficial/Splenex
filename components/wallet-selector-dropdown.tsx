"use client"
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus, Clipboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WalletSelectorDropdownProps {
  address?: string
  onConnectNewWallet: () => void
  onPasteWallet: () => void
}

export function WalletSelectorDropdown({ address, onConnectNewWallet, onPasteWallet }: WalletSelectorDropdownProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!address) {
    return (
      <Button variant="ghost" onClick={onConnectNewWallet} className="text-xs text-gray-400 hover:text-white">
        Connect wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">•</span>
          </div>
          <span>{formatAddress(address)}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#191919] border-gray-700 text-white">
        <DropdownMenuItem onClick={onConnectNewWallet} className="hover:bg-gray-700 cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Connect new wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={onPasteWallet} className="hover:bg-gray-700 cursor-pointer">
          <Clipboard className="h-4 w-4 mr-2" />
          Paste new wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}