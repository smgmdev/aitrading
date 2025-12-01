import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Trade {
  id: number;
  tradeId: string;
  pair: string;
  side: string;
  entryPrice: string;
  currentPrice: string;
  leverage: number;
  pnl: string;
  pnlPercent: string;
  platform: string;
  status: string;
}

export function ActiveTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalExposure, setTotalExposure] = useState(0);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch("/api/positions/open");
        const data = await res.json();
        setTrades(data);
        
        // Calculate total exposure
        const exposure = data.reduce(
          (sum: number, trade: Trade) => sum + parseFloat(trade.entryPrice) * parseFloat(trade.pnl),
          0
        );
        setTotalExposure(exposure);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = async (tradeId: number) => {
    try {
      const trade = trades.find((t) => t.id === tradeId);
      if (!trade) return;

      await fetch(`/api/positions/${tradeId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitPrice: trade.currentPrice }),
      });

      setTrades(trades.filter((t) => t.id !== tradeId));
    } catch (error) {
      console.error("Failed to close position:", error);
    }
  };

  return (
    <div className="bg-background border border-border h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/10">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Open Positions</h3>
        <span className="text-xs font-mono text-muted-foreground" data-testid="text-total-exposure">
          EXPOSURE: ${Math.abs(totalExposure).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex-1 overflow-auto tech-scroll">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No open positions
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground border-b border-border">
                <th className="px-4 py-2 font-medium">PAIR</th>
                <th className="px-4 py-2 font-medium">SIDE</th>
                <th className="px-4 py-2 font-medium">ENTRY</th>
                <th className="px-4 py-2 font-medium">MARK</th>
                <th className="px-4 py-2 font-medium">LEV</th>
                <th className="px-4 py-2 font-medium text-right">PNL (ROE%)</th>
                <th className="px-4 py-2 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trades.map((trade) => {
                const pnlValue = parseFloat(trade.pnl);
                const pnlPercent = parseFloat(trade.pnlPercent);
                return (
                  <tr
                    key={trade.id}
                    className="hover:bg-secondary/20 transition-colors"
                    data-testid={`card-trade-${trade.id}`}
                  >
                    <td className="px-4 py-2.5 font-bold text-foreground">{trade.pair}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[10px] font-bold border",
                          trade.side === "LONG"
                            ? "text-success border-success bg-success/10"
                            : "text-destructive border-destructive bg-destructive/10"
                        )}
                      >
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      ${parseFloat(trade.entryPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-foreground font-medium">
                      ${parseFloat(trade.currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-warning">{trade.leverage}x</td>
                    <td className="px-4 py-2.5 text-right">
                      <div
                        className={cn("font-bold", pnlPercent > 0 ? "text-success" : "text-destructive")}
                        data-testid={`text-pnl-${trade.id}`}
                      >
                        {pnlPercent > 0 ? "+" : ""}
                        {pnlPercent.toFixed(2)}%
                      </div>
                      <div
                        className={cn("text-[10px]", pnlPercent > 0 ? "text-success/70" : "text-destructive/70")}
                      >
                        {pnlValue > 0 ? "+" : ""}
                        {pnlValue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        data-testid={`button-close-trade-${trade.id}`}
                        onClick={() => handleClosePosition(trade.id)}
                        className="text-primary hover:text-primary-foreground hover:bg-primary px-2 py-1 border border-primary transition-colors text-[10px] font-bold uppercase"
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
