/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { WalletModal } from "./wallet-modal"
import { WalletDropdown } from "./wallet-dropdown"
import { BalanceDisplay } from "./balance-display"
import { Menu, X, Wallet } from "lucide-react"
import Image from "next/image";

export function SimpleNavbar() {
  const { isConnected, address } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <>
      <nav className="w-full  h-16 flex items-center justify-end px-14 fixed top-0 z-50 ">




        {/* Wallet Section */}
        <div className="flex items-center gap-3">
          {!isConnected ? (




            <Button
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-yellow-500 text-white bg-black hover:bg-[#111] transition rounded-none"
            >
              <Image
                src="/images/connect-icon.svg" // <-- replace with your actual icon path
                alt="Connect Icon"
                width={18}
                height={18}
              />
              <span>Connect</span>
            </Button>
          ) : (
            <div className="flex items-center gap-3 bg-[#0D0D0D] px-1 py-2">

              <Button
                variant="ghost"
                size="sm"
                className="bg-[#121212] rounded-none"
                asChild
              >
                <a href="/apemode">
                  <img src="/images/apemode.svg" alt="ApeMode" className="h-5 w-5" />
                </a>
              </Button>


              <BalanceDisplay />

              {/* <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg">
                <Wallet className="h-4 w-4 text-gray-400" />
                <span className="text-white font-mono text-sm">{address ? formatAddress(address) : ""}</span>
              </div> */}

              <WalletDropdown />
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-black/95 backdrop-blur-sm z-40 md:hidden">
          <div className="flex flex-col p-4 space-y-4">
            {isConnected && (
              <div className="flex flex-col gap-3 pb-4 border-b border-gray-700">
                <BalanceDisplay />
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg">
                  <Wallet className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-mono text-sm">{address ? formatAddress(address) : ""}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <WalletModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </>
  )
}
