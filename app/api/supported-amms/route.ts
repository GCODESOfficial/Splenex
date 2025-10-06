import { NextResponse } from "next/server"

export async function GET() {
  try {
    const amms = await getSupportedAMMs()

    return NextResponse.json(amms)
  } catch (error) {
    console.error("[v0] Failed to fetch supported AMMs:", error)
    return NextResponse.json({ error: "Failed to fetch AMMs" }, { status: 500 })
  }
}

async function getSupportedAMMs() {
  // This would query LiFi API for supported exchanges/bridges

  // Based on LiFi's typical supported AMMs/DEXs
  const supportedAMMs = [
    { name: "Uniswap", isActive: true },
    { name: "Balancer", isActive: true },
    { name: "PancakeSwap", isActive: true },
    { name: "Trader Joe", isActive: true },
    { name: "Sushiswap", isActive: true },
    { name: "Curve Finance", isActive: true },
    { name: "Raydium", isActive: true },
    { name: "Sushiswap", isActive: true },
    { name: "1inch", isActive: true },
    { name: "Kyber", isActive: true },
    { name: "Bancor", isActive: false },
    { name: "Quickswap", isActive: true },
  ]

  return supportedAMMs
}
