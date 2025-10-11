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
  walletType?: string | null
  onConnectNewWallet: () => void
  onPasteWallet: () => void
}

// Wallet icons mapping - using reliable CDN URLs
const WALLET_ICONS: { [key: string]: string } = {
  rabby: "https://rabby.io/assets/images/logo-128.png",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  coinbase: "https://avatars.githubusercontent.com/u/18060234?s=280&v=4",
  trust: "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",
  brave: "https://brave.com/static-assets/images/brave-logo-sans-text.svg",
  okx: "https://static.okx.com/cdn/assets/imgs/221/8B0F8A7B25C5B0B0.png",
  phantom: "https://phantom.app/img/logo.png",
  walletconnect: "https://walletconnect.com/static/favicon.png",
  zerion: "https://zerion.io/favicon.ico",
}

const WalletIcon = ({ walletType, className = "w-5 h-5" }: { walletType?: string | null; className?: string }) => {
  if (!walletType) return null

  const logoUrl = WALLET_ICONS[walletType.toLowerCase()]
  
  if (!logoUrl) {
    console.log('[WalletIcon] No logo URL found for wallet type:', walletType)
    return null
  }

  console.log('[WalletIcon] Rendering icon for:', walletType, 'URL:', logoUrl)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${walletType} logo`}
      className={`${className} object-contain`}
      onLoad={() => console.log('[WalletIcon] ✅ Successfully loaded:', walletType)}
      onError={(e) => {
        console.error(`[WalletIcon] ❌ FAILED to load ${walletType} from ${logoUrl}`)
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

export function WalletSelectorDropdown({ address, walletType, onConnectNewWallet, onPasteWallet }: WalletSelectorDropdownProps) {
  console.log('[WalletSelectorDropdown] Received props:', { address, walletType })
  
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
        <Button variant="ghost" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
          <WalletIcon walletType={walletType} className="w-5 h-5" />
          <span>{formatAddress(address)}</span>
          <ChevronDown className="h-3 w-3 ml-0.5" />
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