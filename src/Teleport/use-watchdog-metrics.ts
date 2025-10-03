import { useEffect, useState } from "react"

export const useWatchdogRecentlyFailed = (chain: string) => {
  const [recentSimulationFailure, setRecentSimulationFailure] = useState<boolean | null>(null);
  useEffect(() => {
    let interval: number | undefined;
    const fetchMetrics = async () => {
      const result = await watchdogResultRecentlyFailed(chain);
      setRecentSimulationFailure(result);
    };
    fetchMetrics();
    interval = window.setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [chain]);
  return recentSimulationFailure
}

async function watchdogResultRecentlyFailed(chain: string): Promise<boolean> {
  const metricsUrl = {
    ITK: "https://bezzera.integritee.network:4400/metrics-teer-bridge-watchdog-k2p",
    ITP: "https://bezzera.integritee.network:4400/metrics-teer-bridge-watchdog-p2k",
  }[chain.toUpperCase()];
  if (!metricsUrl) {
    console.warn("No metrics URL for chain", chain);
    return false;
  }
  try {
    const res = await fetch(metricsUrl);
    const text = await res.text();
    const regex = /simulation_result\{.*\}\s+(\d+)/;
    const match = text.match(regex);
    const success = match ? Number(match[1]) === 1 : false;
    console.log(`recent watchdog success according to metrics on ${chain}: ${success}`);
    return !success;
  } catch (err) {
    console.error("Error fetching watchdog metrics (safe fallback is to assume failure of simulation):", err);
    return true;
  }
}
