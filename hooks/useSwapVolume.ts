// hooks/useSwapVolume.ts
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSwapVolume() {
  const [totalVolume, setTotalVolume] = useState(0);
  const [dailyData, setDailyData] = useState<{ day: string; total: number }[]>([]);

  useEffect(() => {
    async function fetchVolume() {
      const { data, error } = await supabase
        .from("swap_analytics")
        .select("timestamp, swap_volume_usd");

      if (error) return console.error(error);
      const grouped: Record<string, number> = {};
      data.forEach((row) => {
        const day = new Date(row.timestamp).toISOString().split("T")[0];
        grouped[day] = (grouped[day] || 0) + Number(row.swap_volume_usd || 0);
      });
      setDailyData(Object.entries(grouped).map(([day, total]) => ({ day, total })));
      setTotalVolume(data.reduce((a, b) => a + Number(b.swap_volume_usd || 0), 0));
    }
    fetchVolume();
  }, []);

  return { totalVolume, dailyData };
}
