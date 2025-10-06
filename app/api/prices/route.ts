import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get("symbols")

    if (!symbols) {
      return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 })
    }

    const coinIdMap: { [symbol: string]: string } = {
      ETH: "ethereum",
      BNB: "binancecoin",
      USDT: "tether",
      USDC: "usd-coin",
      DAI: "dai",
      WBTC: "wrapped-bitcoin",
      BTCB: "bitcoin-cash-abc-2",
      WETH: "weth",
      UNI: "uniswap",
      AAVE: "aave",
      LINK: "chainlink",
    }

    const symbolArray = symbols.split(",")
    const coinIds = symbolArray.map((symbol) => coinIdMap[symbol.toUpperCase()] || symbol.toLowerCase()).join(",")

    console.log(`[v0] Fetching prices for symbols: ${symbols}, coinIds: ${coinIds}`)

    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`)

    if (!response.ok) {
      console.log(`[v0] CoinGecko API failed with status: ${response.status}`)
      return NextResponse.json({}, { status: 200 })
    }

    const data = await response.json()
    console.log(`[v0] CoinGecko API response:`, data)

    const prices: { [symbol: string]: number } = {}
    symbolArray.forEach((symbol) => {
      const coinId = coinIdMap[symbol.toUpperCase()] || symbol.toLowerCase()
      if (data[coinId]) {
        prices[symbol.toUpperCase()] = data[coinId].usd
      }
    })

    return NextResponse.json(prices)
  } catch (error) {
    console.error("[v0] Price API error:", error)
    return NextResponse.json({}, { status: 200 })
  }
}
