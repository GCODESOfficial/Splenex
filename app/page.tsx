/* app/page.tsx */
"use client";

import Image from "next/image";

export default function Page() {
  return (
    <main className="bg-black text-white min-h-screen px-4 md:px-12 py-10">
      {/* Hero */}
      <h1 className="text-center text-xl md:text-2xl font-medium mb-8">
        Join thousands of traders powering the future of cross-chain liquidity
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">$0.0571</p>
          <p className="text-sm text-gray-400">SPX Token Price</p>
        </div>
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">40+</p>
          <p className="text-sm text-gray-400">Active Networks</p>
        </div>
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">$1,482,210</p>
          <p className="text-sm text-gray-400">Trading Volume (24h)</p>
        </div>
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">$35,000</p>
          <p className="text-sm text-gray-400">Total Value Locked (TVL)</p>
        </div>
      </div>

      {/* Supported Chains */}
      <h2 className="text-sm mb-3">Supported Chains</h2>
      <div className="flex flex-wrap gap-3 mb-10">
        {[
          "ethereum",
          "solana",
          "bnb",
          "arbitrum",
          "avalanche",
          "polygon",
          "tron",
          "stellar",
          "base",
          "optimism",
          "cosmos",
          "avail",
          "polkadot",
        ].map((chain) => (
          <div
            key={chain}
            className="bg-[#0C0C0C] px-4 py-2 rounded-md flex items-center justify-center"
          >
            <Image
              src={`/images/${chain}.svg`}
              alt={chain}
              width={20}
              height={20}
              className="mr-2"
            />
            <span className="text-sm capitalize">{chain}</span>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Donut Chart (replace with chart lib later) */}
        <div className="bg-[#0C0C0C] p-6 flex flex-col items-center justify-center">
          <div className="relative w-60 h-60 rounded-full border-[30px] border-yellow-400 flex items-center justify-center">
            <span className="text-xl font-bold">$1,482,210</span>
          </div>
          <div className="mt-6 text-left">
            <h3 className="text-yellow-400 font-semibold mb-2">
              Splenex Revenue
            </h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>▉ Cross-Chain Swap</li>
              <li>▉ Cross-Market Swap</li>
              <li>▉ sFund DAO Stakers</li>
              <li>▉ sNFT</li>
            </ul>
          </div>
        </div>

        {/* Line Chart (static placeholder) */}
        <div className="bg-[#0C0C0C] p-6">
          <h3 className="mb-4">Analysis</h3>
          <div className="w-full h-60 bg-black border border-gray-800 flex items-center justify-center">
            {/* Replace with chart library */}
            <span className="text-gray-500 text-sm">[Line Chart Here]</span>
          </div>
          {/* Tabs */}
          <div className="flex gap-3 mt-4">
            {["1D", "3D", "1W", "1M", "3M", "All Time"].map((tab, i) => (
              <button
                key={i}
                className={`px-3 py-1 border text-xs ${
                  tab === "3D"
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "border-gray-700 text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AMM Section */}
      <h2 className="text-sm mb-3">Automated Market Makers Section</h2>
      <p className="text-xs text-gray-400 mb-4">
        Splenex AMMs ensure optimal pricing and deep liquidity across chains — so
        every trade is fast, fair, and efficient.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          "Uniswap",
          "Balancer",
          "Pancake Swap",
          "Trader Joe",
          "Sushiswap",
          "Curve Finance",
          "Raydium",
          "Sushiswap2",
        ].map((amm) => (
          <div
            key={amm}
            className="bg-[#0C0C0C] px-4 py-2 rounded-md flex items-center justify-center"
          >
            <span className="text-sm">{amm}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
