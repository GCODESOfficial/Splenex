/* app/comingsoon.tsx */
"use client";

import Image from "next/image";

export default function ComingSoon() {
  return (
    <section className="flex items-center justify-center min-h-screen mt-24">
      {/* Card */}
      <div className="relative bg-[#191919] text-white w-[320px] md:w-[400px] border border-[#FFD600]">
        {/* Top yellow bar */}
        <div className="absolute -top-4 left-0 right-0 h-4 bg-[#FFD600]" />

        {/* Main content */}
        <div className="flex flex-col items-center justify-center py-26 px-6 text-center space-y-4">
          {/* Hourglass Icon */}
          <div className="mb-6">
  <Image
    src="/images/hourglass.svg" // <-- replace with your actual image path
    alt="Hourglass Icon"
    width={50}
    height={50}
    className="mx-auto"
  />
</div>


          {/* Title */}
          <h2 className="text-2xl font-semibold">Coming Soon</h2>

          {/* Subtitle */}
          <p className=" text-[#B1B1B1]">
            Non-custodial strategies with <br/> transparent metrics.
          </p>
        </div>

        {/* Divider */}
        <div className="border h-6 bg-black border-[#FFD600]" />

        {/* Bottom section */}
        <div className="flex items-center justify-between text-xs md:text-sm px-4 py-3 bg-[#191919]">
          {/* Price */}
         <div className="flex items-center gap-1 font-medium text-white text-xl">
  <Image
    src="/images/token-icon.svg" // <-- replace with your actual image path
    alt="Token Icon"
    width={20}
    height={20}
    className="w-6 h-6 rounded-full"
  />
  $0.0571
</div>

          {/* MarketCap */}
          <div className="text-[#8F8F8F]">
            MarketCap <br />
            <span className="text-[#FFD262] font-semibold">$1,303,567.09</span>
          </div>

          {/* Holders */}
          <div className="text-[#8F8F8F]">
            Holders <br />
            <span className="text-white font-semibold">800</span>
          </div>

          {/* Networks */}
          <div className="text-[#8F8F8F]">
            Networks <br />
            <span className="text-white font-semibold">95+</span>
          </div>
        </div>

        {/* Bottom yellow bar */}
        <div className="absolute -bottom-4 left-0 right-0 h-4 bg-[#FFD600]" />
      </div>
    </section>
  );
}
