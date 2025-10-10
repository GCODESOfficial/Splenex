"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { TrendingUp, RefreshCw, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function BalanceDisplay() {
  const { totalUsdBalance, tokenBalances, refreshBalances, isConnected } = useWallet()
  const [showTooltip, setShowTooltip] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const formatUsd = (v: number) => {
    if (!v || isNaN(v)) return "$0.00"
    if (v > 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
    if (v > 1_000) return `$${(v / 1_000).toFixed(2)}K`
    return `$${v.toFixed(2)}`
  }

  const handleClick = () => {
    if (isMobile) {
      setIsPortfolioModalOpen(true)
    } else {
      router.push("/profile")
    }
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 md:gap-2 md:px-3 md:py-3 md:bg-[#121212] cursor-pointer select-none"
        onMouseEnter={() => !isMobile && setShowTooltip(true)}
        onMouseLeave={() => !isMobile && setShowTooltip(false)}
        onClick={handleClick}
      >
        <Image src="/images/purse.svg" alt="wallet" width={18} height={18} />
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm">
            {isConnected ? formatUsd(totalUsdBalance) : "$0.00"}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            refreshBalances()
          }}
          className="md:ml-3 text-gray-400 hover:text-white"
          title="Refresh balances"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* --- Hover tooltip (Desktop only) --- */}
      {showTooltip && isConnected && !isMobile && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#121212] border border-[#1E1E1E] shadow-xl z-50 p-4">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-700 pb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-white font-semibold">Portfolio</span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {tokenBalances.map((t, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <div>
                  <div className="text-white text-sm font-medium">{t.symbol}</div>
                  <div className="text-gray-400 text-xs">{t.chain}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">{t.balance}</div>
                  <div className="text-gray-400 text-xs">${t.usdValue?.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-gray-700 pt-2 flex justify-between text-sm">
            <span className="text-gray-400">Total</span>
            <span className="text-green-400 font-semibold">{formatUsd(totalUsdBalance)}</span>
          </div>
        </div>
      )}

      {/* --- Modal (Mobile only) --- */}
      <Dialog open={isPortfolioModalOpen} onOpenChange={setIsPortfolioModalOpen}>
        <DialogContent className="bg-[#121212] border border-[#FCD404] text-white rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-yellow-400 flex justify-between items-center">
              Portfolio
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPortfolioModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto">
            {tokenBalances.map((t, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[#1E1E1E]">
                <div>
                  <div className="text-white text-sm font-medium">{t.symbol}</div>
                  <div className="text-gray-400 text-xs">{t.chain}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">{t.balance}</div>
                  <div className="text-gray-400 text-xs">${t.usdValue?.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-700 pt-3 flex justify-between text-sm">
            <span className="text-gray-400">Total</span>
            <span className="text-green-400 font-semibold">{formatUsd(totalUsdBalance)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
