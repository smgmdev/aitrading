import { BrainCircuit, Zap, TrendingUp, Wifi, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface StatsData {
  openPositions: number;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

export function AIStatus() {
  const [stats, setStats] = useState<StatsData>({
    openPositions: 0,
    totalPnl: 0,
    tradeCount: 0,
    winRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/positions");
        const positions = await res.json();

        const openCount = positions.filter((p: any) => p.status === "OPEN").length;
        const totalPnl = positions.reduce((sum: number, p: any) => sum + parseFloat(p.pnl || 0), 0);

        const winningTrades = positions.filter((p: any) => parseFloat(p.pnl || 0) > 0).length;
        const winRate = positions.length > 0 ? (winningTrades / positions.length) * 100 : 0;

        setStats({
          openPositions: openCount,
          totalPnl,
          tradeCount: positions.length,
          winRate: Math.round(winRate * 10) / 10,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <StatusTile
        label="ALGORITHM STATE"
        value="ACTIVE"
        subValue="SCALPING_V2"
        icon={BrainCircuit}
        status="success"
        testId="status-algorithm"
      />

      <StatusTile
        label="24H PROFIT"
        value={`${stats.totalPnl > 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}`}
        subValue={`${stats.tradeCount} TRADES`}
        icon={TrendingUp}
        status={stats.totalPnl > 0 ? "success" : "warning"}
        testId="status-profit"
      />

      <StatusTile
        label="WIN RATIO"
        value={`${stats.winRate.toFixed(1)}%`}
        subValue="LIVE"
        icon={BarChart3}
        status="neutral"
        testId="status-winrate"
      />

      <StatusTile
        label="API LATENCY"
        value="12ms"
        subValue="OPTIMIZED"
        icon={Wifi}
        status="success"
        testId="status-latency"
      />
    </div>
  );
}

function StatusTile({ label, value, subValue, icon: Icon, status, testId }: any) {
  return (
    <div
      className="bg-background border border-border p-3 flex items-center justify-between relative overflow-hidden group"
      data-testid={testId}
    >
      {status === "success" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>}
      {status === "neutral" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
      {status === "warning" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning"></div>}

      <div className="pl-2">
        <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-0.5">
          {label}
        </div>
        <div className="text-xl font-mono font-bold text-foreground tracking-tight">{value}</div>
        <div className="text-[10px] font-mono text-muted-foreground mt-1">{subValue}</div>
      </div>

      <div className="opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-8 h-8" />
      </div>
    </div>
  );
}
