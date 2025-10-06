/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { X, Copy, BarChart3, TrendingUp, Maximize2 } from "lucide-react"

interface Token {
  symbol: string
  name: string
  address: string
  chainId: number
  chainName: string
}

interface PriceData {
  timestamp: number
  price: number
  volume: number
  time: string
}

interface TokenPriceChartProps {
  isOpen: boolean
  onClose: () => void
  fromToken: Token
  toToken: Token
}

export function TokenPriceChart({ isOpen, onClose, fromToken, toToken }: TokenPriceChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeframe, setTimeframe] = useState<"5m" | "1h" | "4h" | "24h" | "7d" | "30d" | "Max">("24h")
  const [activeToken, setActiveToken] = useState<Token>(fromToken)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [marketCap, setMarketCap] = useState<string>("$1B")
  const [volume24h, setVolume24h] = useState<string>("$323M")
  const [liquidity, setLiquidity] = useState<string>("$8.6M")

  useEffect(() => {
    if (isOpen && activeToken) {
      fetchTokenPriceData()
    }
  }, [isOpen, activeToken, timeframe])

  const fetchTokenPriceData = async () => {
    setIsLoading(true)
    try {
      const mockPriceData = generateMockPriceData(timeframe)
      setPriceData(mockPriceData)

      if (mockPriceData.length > 0) {
        const latest = mockPriceData[mockPriceData.length - 1]
        const earliest = mockPriceData[0]
        setCurrentPrice(latest.price)
        setPriceChange(((latest.price - earliest.price) / earliest.price) * 100)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch token price data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  type Timeframe = "5m" | "1h" | "4h" | "24h" | "7d" | "30d" | "Max";

  const generateMockPriceData = (timeframe: Timeframe): PriceData[] => {
    const now = Date.now()
    const intervals: Record<Timeframe, { points: number; interval: number }> = {
      "5m": { points: 288, interval: 5 * 60 * 1000 }, // 5min intervals for 24h
      "1h": { points: 168, interval: 60 * 60 * 1000 }, // hourly for 7 days
      "4h": { points: 42, interval: 4 * 60 * 60 * 1000 }, // 4h intervals for 7 days
      "24h": { points: 30, interval: 24 * 60 * 60 * 1000 }, // daily for 30 days
      "7d": { points: 52, interval: 7 * 24 * 60 * 60 * 1000 }, // weekly for 1 year
      "30d": { points: 12, interval: 30 * 24 * 60 * 60 * 1000 }, // monthly for 1 year
      Max: { points: 100, interval: 7 * 24 * 60 * 60 * 1000 }, // weekly for 2 years
    }

    const config = intervals[timeframe]
    const basePrice =
      activeToken.symbol === "ETH"
        ? 4500
        : activeToken.symbol === "BNB"
          ? 600
          : activeToken.symbol === "USDC"
            ? 1
            : 2500
    const data: PriceData[] = []

    for (let i = 0; i < config.points; i++) {
      const timestamp = now - (config.points - i - 1) * config.interval
      const volatility = activeToken.symbol === "USDC" ? 0.001 : 0.05
      const trend = Math.sin(i / 10) * 0.02
      const randomChange = (Math.random() - 0.5) * volatility
      const price = basePrice * (1 + trend + randomChange)
      const volume = Math.random() * 1000000 + 500000

      data.push({
        timestamp,
        price: Math.max(price, basePrice * 0.8),
        volume,
        time: formatTimeForChart(timestamp, timeframe),
      })
    }

    return data
  }

  const formatTimeForChart = (timestamp: number, timeframe: string) => {
    const date = new Date(timestamp)
    if (timeframe === "5m" || timeframe === "1h") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(activeToken.address)
  }

  const isPositive = priceChange >= 0

  return (
    <div>
      <div className="max-w-6xl h-[700px] bg-black border border-gray-800 p-0 overflow-hidden">
        <div className="p-6 h-full flex flex-col">
          {/* Header with token switcher */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{activeToken.symbol.charAt(0)}</span>
                </div>
                <div className="text-white font-medium">{activeToken.symbol}</div>
                <div className="text-gray-400">{activeToken.name}</div>
              </div>

              {/* Token pair switcher */}
              <div className="flex items-center space-x-2 ml-8">
                <Button
                  variant={activeToken === fromToken ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveToken(fromToken)}
                  className={activeToken === fromToken ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"}
                >
                  {fromToken.symbol}
                </Button>
                <span className="text-gray-500">/</span>
                <Button
                  variant={activeToken === toToken ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveToken(toToken)}
                  className={activeToken === toToken ? "bg-yellow-400 text-black" : "text-gray-400 hover:text-white"}
                >
                  {toToken.symbol}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-400">
                {activeToken.symbol}/{toToken.symbol === activeToken.symbol ? fromToken.symbol : toToken.symbol}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Price and stats row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-white">{formatPrice(currentPrice)}</div>
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${isPositive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}
                >
                  <TrendingUp className={`h-3 w-3 ${!isPositive && "rotate-180"}`} />
                  <span>
                    {isPositive ? "+" : ""}
                    {priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
                  <span className="text-black text-xs font-bold">{activeToken.symbol.charAt(0)}</span>
                </div>
                <span className="text-gray-400">
                  {activeToken.address.slice(0, 8)}...{activeToken.address.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="p-1 h-auto text-gray-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-gray-400">Mkt Cap</div>
                <div className="text-white font-medium">{marketCap}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">24h Vol</div>
                <div className="text-white font-medium">{volume24h}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Liquidity</div>
                <div className="text-white font-medium">{liquidity}</div>
              </div>
            </div>
          </div>

          {/* Timeframe buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1">
              {(["5m", "1h", "4h", "24h", "7d", "30d", "Max"] as const).map((tf) => {
                const changePercent = Math.random() * 2 - 1 // Random change for demo
                const isPositiveChange = changePercent >= 0
                return (
                  <div key={tf} className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-2 text-xs ${timeframe === tf ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}
                    >
                      {tf}
                    </Button>
                    <div className={`text-xs mt-1 ${isPositiveChange ? "text-green-400" : "text-red-400"}`}>
                      {isPositiveChange ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading chart data...</div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  price: {
                    label: "Price",
                    color: isPositive ? "#10B981" : "#EF4444",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      tickFormatter={formatPrice}
                      domain={["dataMin - dataMin*0.01", "dataMax + dataMax*0.01"]}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [formatPrice(value), "Price"]}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#10B981" : "#EF4444"}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3, fill: isPositive ? "#10B981" : "#EF4444" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Volume</span>
                <span className="text-white">$8.8M</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Txns</span>
                <span className="text-white">15.14K</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Traders</span>
                <span className="text-white">12.61K</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                </div>
              </div>
            </div>
            <div className="text-gray-400 text-xs">BscScan</div>
          </div>
        </div>
      </div>
    </div>
  )
}
