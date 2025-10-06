"use client"

import { useState, useEffect } from "react"

interface AMM {
  name: string
  logo?: string
  isActive: boolean
}

export function AutomatedMarketMakers() {
  const [amms, setAmms] = useState<AMM[]>([])

  useEffect(() => {
    const fetchAMMs = async () => {
      try {
        const response = await fetch("/api/supported-amms")
        if (response.ok) {
          const data = await response.json()
          setAmms(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch AMMs:", error)
      }
    }

    fetchAMMs()
  }, [])

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h2 className="text-white text-lg font-medium mb-2">Automated Market Makers Section</h2>
      <p className="text-gray-400 text-sm mb-4">
        Splenex AMMs ensure optimal pricing and deep liquidity across chains — so every trade is fast, fair, and
        efficient.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {amms.map((amm, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-3 rounded-lg border ${
              amm.isActive ? "bg-gray-800 border-gray-600" : "bg-gray-800/50 border-gray-700 opacity-60"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${amm.isActive ? "bg-green-400" : "bg-gray-500"}`} />
            <span className="text-white text-sm">{amm.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
