"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { TrendingUp, RefreshCw } from "lucide-react";
import Image from "next/image";

export function BalanceDisplay() {
  const { totalUsdBalance, tokenBalances, balance, refreshBalances, isConnected } = useWallet();
  const [showTooltip, setShowTooltip] = useState(false);

  const formatUsd = (v: number) => {
    if (!v || isNaN(v)) return "$0.00";
    if (v > 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v > 1_000) return `$${(v / 1_000).toFixed(2)}K`;
    return `$${v.toFixed(2)}`;
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-3 py-2 bg-[#121212] cursor-pointer rounded-lg"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Image src="/images/purse.svg" alt="wallet" width={18} height={18} />
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm">
            {isConnected ? formatUsd(totalUsdBalance) : "$0.00"}
          </span>
          <span className="text-gray-400 text-xs">{isConnected ? `${balance} native` : "Disconnected"}</span>
        </div>
        <button
          onClick={refreshBalances}
          className="ml-3 text-gray-400 hover:text-white"
          title="Refresh balances"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {showTooltip && isConnected && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#121212] shadow-xl z-50 p-4 rounded-lg">
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
    </div>
  );
}
