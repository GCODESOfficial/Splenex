/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Clock, Info } from "lucide-react"

interface Token {
  symbol: string
  name: string
  address: string
  chainId: number
  chainName: string
  balance?: string
  usdValue?: string
  icon?: string
  decimals?: number
}

interface LimitOrderInterfaceProps {
  fromToken: Token
  toToken: Token
  fromAmount: string
  onFromAmountChange: (amount: string) => void
  onPlaceLimitOrder: (orderData: any) => void
  isConnected: boolean
}

export function LimitOrderInterface({
  fromToken,
  toToken,
  fromAmount,
  onFromAmountChange,
  onPlaceLimitOrder,
  isConnected,
}: LimitOrderInterfaceProps) {
  const [limitRate, setLimitRate] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [expiryTime, setExpiryTime] = useState<"1h" | "6h" | "24h" | "custom">("24h")
  const [customExpiry, setCustomExpiry] = useState({ hours: 0, minutes: 0 })
  const [slippageTolerance, setSlippageTolerance] = useState([1])

  // Calculate to amount based on limit rate
  useEffect(() => {
    if (fromAmount && limitRate) {
      const calculatedToAmount = (Number.parseFloat(fromAmount) * Number.parseFloat(limitRate)).toFixed(6)
      setToAmount(calculatedToAmount)
    } else {
      setToAmount("")
    }
  }, [fromAmount, limitRate])

  const getExpiryInHours = () => {
    switch (expiryTime) {
      case "1h":
        return 1
      case "6h":
        return 6
      case "24h":
        return 24
      case "custom":
        return customExpiry.hours + customExpiry.minutes / 60
      default:
        return 24
    }
  }

  const handlePlaceLimitOrder = () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!fromAmount || !limitRate) {
      alert("Please enter both amount and limit rate")
      return
    }

    const orderData = {
      fromToken,
      toToken,
      fromAmount,
      limitRate,
      toAmount,
      expiryHours: getExpiryInHours(),
      slippage: slippageTolerance[0],
      timestamp: Date.now(),
    }

    onPlaceLimitOrder(orderData)
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Limit Rate Setting */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium">Limit Rate</label>
          <div className="flex items-center space-x-1 text-gray-400">
            <Info className="h-3 w-3" />
            <span className="text-xs">Rate at which swap executes</span>
          </div>
        </div>

        <div className="bg-[#1F1F1F] border border-[#2C2C2C] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {fromToken.symbol === "ETH" ? "Ξ" : fromToken.symbol.charAt(0)}
                </span>
              </div>
              <span className="text-white font-medium">{fromToken.symbol}</span>
            </div>

            <span className="text-gray-400 text-lg">=</span>

            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="0"
                value={limitRate}
                onChange={(e) => setLimitRate(e.target.value)}
                className="bg-transparent border-none text-right text-xl font-medium text-white p-0 h-auto focus-visible:ring-0 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">
                  {toToken.symbol === "USDC" ? "$" : toToken.symbol.charAt(0)}
                </span>
              </div>
              <span className="text-white font-medium">{toToken.symbol}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-2">
            Set the minimum rate at which you want the swap to execute. Your order will only fill when this rate is
            reached or better.
          </div>
        </div>
      </div>

      {/* Expected Output */}
      {toAmount && (
        <div className="bg-[#1F1F1F] border border-[#2C2C2C] p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">You will receive</span>
            <div className="flex items-center space-x-2">
              <span className="text-white text-lg font-medium">{toAmount}</span>
              <span className="text-gray-400">{toToken.symbol}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expiry Time */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <label className="text-white text-sm font-medium">Expiry Time</label>
        </div>

        <div className="flex space-x-2">
          {(["1h", "6h", "24h", "custom"] as const).map((time) => (
            <Button
              key={time}
              variant={expiryTime === time ? "default" : "ghost"}
              size="sm"
              onClick={() => setExpiryTime(time)}
              className={
                expiryTime === time
                  ? "bg-yellow-400 text-black hover:bg-yellow-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }
            >
              {time === "1h" ? "1 Hour" : time === "6h" ? "6 Hours" : time === "24h" ? "24 Hours" : "Custom"}
            </Button>
          ))}
        </div>

        {expiryTime === "custom" && (
          <div className="flex items-center space-x-4 bg-[#1F1F1F] border border-[#2C2C2C] p-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="0"
                value={customExpiry.hours}
                onChange={(e) => setCustomExpiry((prev) => ({ ...prev, hours: Number.parseInt(e.target.value) || 0 }))}
                className="w-16 bg-transparent border-gray-600 text-white text-center"
                min="0"
                max="168"
              />
              <span className="text-gray-400 text-sm">hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="0"
                value={customExpiry.minutes}
                onChange={(e) =>
                  setCustomExpiry((prev) => ({ ...prev, minutes: Number.parseInt(e.target.value) || 0 }))
                }
                className="w-16 bg-transparent border-gray-600 text-white text-center"
                min="0"
                max="59"
              />
              <span className="text-gray-400 text-sm">minutes</span>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="text-2xl font-mono text-white">
            {expiryTime === "custom"
              ? `${String(customExpiry.hours).padStart(2, "0")}:${String(customExpiry.minutes).padStart(2, "0")}`
              : expiryTime === "1h"
                ? "01:00"
                : expiryTime === "6h"
                  ? "06:00"
                  : "24:00"}
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center">
          Set how long your order stays active. If the target rate isn&apos;t reached before expiry, the order will be
          cancelled.
        </div>
      </div>

      {/* Slippage Tolerance */}
      <div className="space-y-3">
        <label className="text-white text-sm font-medium">Slippage Tolerance</label>

        <div className="bg-[#1F1F1F] border border-[#2C2C2C] mt-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <Slider
              value={slippageTolerance}
              onValueChange={setSlippageTolerance}
              max={5}
              min={0.1}
              step={0.1}
              className="flex-1 mr-4 bg-[#121212]"
            />
            <div className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-medium min-w-[60px] text-center">
              {slippageTolerance[0]}%
            </div>
          </div>

          <div className="text-xs text-gray-400">Maximum price movement you&apos;re willing to accept during execution</div>
        </div>
      </div>

      {/* Place Limit Order Button */}
      <Button
        onClick={handlePlaceLimitOrder}
        disabled={!fromAmount || !limitRate}
        className="w-full h-12 bg-gradient-to-r from-[#F3DA5F] to-[#FCD404] text-black font-medium text-lg"
      >
        Place Limit Swap
      </Button>

      {/* Info Text */}
      <div className="text-xs text-gray-400 text-center leading-relaxed">
        Limit orders are executed automatically when market conditions meet your specified rate. Orders may be partially
        filled based on available liquidity.
      </div>
    </div>
  )
}
