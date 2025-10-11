/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSwapVolume } from "@/hooks/useSwapVolume";
import { getChains, getTools } from "@lifi/sdk";

interface Amm {
  key: string;
  name: string;
  logoURI: string;
  supportedChains: number[];
}

export default function Page() {
  const [chains, setChains] = useState<any[]>([]);
 const [amms, setAmms] = useState<Amm[]>([]);
  const { totalVolume, dailyData } = useSwapVolume();
  const [activeRange, setActiveRange] = useState("All Time");

 useEffect(() => {
  async function fetchData() {
    try {
      const supportedChains = await getChains();
      setChains(supportedChains);

      const tools = await getTools();
      // Save full AMM objects, not just names
      setAmms(tools.exchanges);
    } catch (error) {
      console.error("Failed to fetch network/AMM data:", error);
    }
  }
  fetchData();
}, []);

  // ✅ Filter data based on active time range
  const filteredData = useMemo(() => {
    if (activeRange === "All Time") return dailyData;
    if (!dailyData || dailyData.length === 0) return [];

    const days = {
      "1D": 1,
      "3D": 3,
      "1W": 7,
      "1M": 30,
      "3M": 90,
    }[activeRange] as number | undefined;

    if (!days) return dailyData;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return dailyData.filter((d) => new Date(d.day) >= cutoff);
  }, [dailyData, activeRange]);


   const [rotation, setRotation] = useState(0)

  // Rotate according to volume
  useEffect(() => {
    if (totalVolume > 0) {
      const interval = setInterval(() => {
        setRotation((prev) => (prev + Math.min(totalVolume / 1000000, 3)) % 360)
      }, 30)
      return () => clearInterval(interval)
    }
  }, [totalVolume])

  // Dynamic border color based on volume level
  const getBorder = () => {
    if (totalVolume <= 0) return "border-[#1A1A1C]"
    if (totalVolume < 1000) return "border-yellow-700"
    if (totalVolume < 100000) return "border-yellow-500"
    return "border-yellow-400"
  }

  return (
    <main className="bg-black text-white min-h-screen px-4 md:px-12 py-10 pt-14 overflow-hidden">
      {/* Hero */}
      <h1 className="text-left text-xl md:text-2xl font-medium mb-8">
        Join thousands of traders powering the future of cross-chain liquidity
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-[#FCD404]">Token Price</p>
        </div>
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">{chains.length}</p>
          <p className="text-sm text-[#FCD404]">Active Networks</p>
        </div>
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">
            ${totalVolume.toLocaleString()}
          </p>
          <p className="text-sm text-[#FCD404]">Trading Volume (All Time)</p>
        </div>
        <div className="bg-[#0C0C0C] p-6 text-center">
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-[#FCD404]">Locked Tokens</p>
        </div>
      </div>

      {/* Cross-Chain Networks (Marquee Scroll) */}
      <h2 className="md:text-sm text-lg mb-3">Supported Chains</h2>
      <div className="relative w-full overflow-hidden mb-10">
        <div className="flex gap-4 animate-scroll whitespace-nowrap">
          {chains.length > 0 ? (
            [...chains, ...chains].map((chain, i) => (
              <div
                key={`${chain.id}-${i}`}
                className="bg-[#0C0C0C] px-4 py-2 flex items-center justify-center min-w-[140px]"
              >
                {chain.logoURI && (
                  <Image
                    src={chain.logoURI}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                )}
                <span className="text-sm capitalize">{chain.name}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Loading networks...</p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
       <div className="bg-[#0C0C0C] p-6 px-2 flex gap-6  items-center justify-center">
      <div
        className="relative md:w-60 md:h-60 w-40 h-40 rounded-full border-[30px] transition-all duration-500"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s linear",
          borderColor: totalVolume > 0 ? "#FED402" : "#1A1A1C",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {totalVolume > 0 ? `$${totalVolume.toLocaleString()}` : "$0"}
          </span>
        </div>
      </div>

      <div className="mt-6 text-left">
  <h3 className="text-[#FCD404] md:text-base text-sm font-semibold mb-3">Splenex Revenue</h3>
  <ul className="space-y-2 md:text-sm text-xs text-gray-300">
    <li className="flex items-center gap-2">
      <span className="w-1 h-4 bg-[#FED402]"></span>
      <span>Cross-Chain Swap</span>
    </li>
    <li className="flex items-center gap-2">
      <span className="w-1 h-4 bg-[#AE7F40]"></span>
      <span>Cross-Market Swap</span>
    </li>
    <li className="flex items-center gap-2">
      <span className="w-1 h-4 bg-[#786501]" style={{ backgroundColor: "#6B6F00" }}></span>
      <span>sFund DAO Stakers</span>
    </li>
    <li className="flex items-center gap-2">
      <span className="w-1 h-4 bg-[#FFB44F]"></span>
      <span>sNFT</span>
    </li>
  </ul>
</div>

    </div>

        {/* Line Chart */}
        <div className="bg-[#0C0C0C] p-6">
          <h3 className="mb-4">Trading Volume Analysis</h3>
          <div className="w-full h-60 bg-black border border-gray-800 flex items-center justify-center">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#FCD404"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-gray-500 text-sm">
                No volume data available
              </span>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex md:gap-3 mt-4">
            {["1D", "3D", "1W", "1M", "3M", "All Time"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRange(tab)}
                className={`px-3 py-1 border text-xs transition ${
                  tab === activeRange
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "border-gray-700 text-gray-300 hover:border-yellow-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

     {/* AMM Section */}
<h2 className="text-sm md:text-xl mb-3">Automated Market Makers Section</h2>
<p className="text-xs md:text-base text-gray-400 mb-4">
  Splenex AMMs ensure optimal pricing and deep liquidity across chains so every trade is fast, fair, and efficient.
</p>

<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:w-7/12">
  {amms.length > 0 ? (
    amms.map((amm: any) => (
      <div
        key={amm.id || amm.name}
        className="bg-[#0C0C0C] px-4 py-3 flex items-center gap-2 "
      >
        {amm.logoURI ? (
          <Image
            src={amm.logoURI}
            alt={amm.name || amm.id}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <div className="w-5 h-5 bg-[#1A1A1A] flex items-center justify-center text-gray-500 text-xs">
            ⚙️
          </div>
        )}
        <span className="md:text-sm text-xs capitalize text-gray-200">
          {amm.name || amm.id}
        </span>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-sm">Loading AMMs...</p>
  )}
</div>


      {/* Infinite Scroll Animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          display: inline-flex;
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </main>
  );
}
