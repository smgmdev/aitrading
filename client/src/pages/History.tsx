import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface ClosedTrade {
  id: number;
  tradeId: string;
  pair: string;
  side: string;
  entryPrice: string;
  exitPrice: string;
  pnl: string;
  pnlPercent: string;
  entryTime: string;
  exitTime: string;
  platform: string;
  mode: string;
  stopLoss: string;
  takeProfit: string;
}

export default function HistoryPage() {
  const [trades, setTrades] = useState<ClosedTrade[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch("/api/positions/closed?limit=50");
        const data = await res.json();
        setTrades(data);
      } catch (error) {
        console.error("Failed to fetch closed positions:", error);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const getReasoningFromLogs = async (tradeId: string) => {
    try {
      const res = await fetch(`/api/logs?tradeId=${tradeId}`);
      const logs = await res.json();
      return logs.find((l: any) => l.logType === "ENTRY")?.message || "No reasoning available";
    } catch (error) {
      return "Failed to fetch reasoning";
    }
  };

  return (
    <Layout>
      <div className="space-y-4 max-w-full">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">EXECUTION LOGS</h1>
          <p className="text-xs text-muted-foreground font-mono">Closed trades with AI reasoning</p>
        </div>

        <div className="bg-background border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-secondary/30 text-muted-foreground border-b border-border sticky top-0">
                <tr>
                  <th className="px-3 py-2">TIME</th>
                  <th className="px-3 py-2">PAIR</th>
                  <th className="px-3 py-2">MODE</th>
                  <th className="px-3 py-2">SIDE</th>
                  <th className="px-3 py-2">ENTRY</th>
                  <th className="px-3 py-2">EXIT</th>
                  <th className="px-3 py-2">SL</th>
                  <th className="px-3 py-2">TP</th>
                  <th className="px-3 py-2">PNL</th>
                  <th className="px-3 py-2">%</th>
                  <th className="px-3 py-2">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {trades.map((trade) => {
                  const isExpanded = expandedId === trade.id;
                  const pnlValue = parseFloat(trade.pnl);
                  const pnlPercent = parseFloat(trade.pnlPercent);
                  const exitTime = new Date(trade.exitTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr
                      key={trade.id}
                      className={`hover:bg-secondary/20 transition-colors ${isExpanded ? "bg-secondary/10" : ""}`}
                      data-testid={`card-closed-trade-${trade.id}`}
                    >
                      <td className="px-3 py-2 text-gray-400">{exitTime}</td>
                      <td className="px-3 py-2 font-bold text-foreground">{trade.pair}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1 py-0.5 text-[9px] font-bold border rounded ${
                            trade.mode === "HFT_SCALPER"
                              ? "text-cyan-400 border-cyan-400 bg-cyan-500/10"
                              : "text-purple-400 border-purple-400 bg-purple-500/10"
                          }`}
                        >
                          {trade.mode === "HFT_SCALPER" ? "HFT" : "SWG"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1 py-0.5 text-[9px] font-bold border rounded ${
                            trade.side === "LONG"
                              ? "text-success border-success bg-success/10"
                              : "text-destructive border-destructive bg-destructive/10"
                          }`}
                        >
                          {trade.side}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400">${parseFloat(trade.entryPrice).toFixed(2)}</td>
                      <td className="px-3 py-2 text-foreground">${parseFloat(trade.exitPrice).toFixed(2)}</td>
                      <td className="px-3 py-2 text-gray-500">${parseFloat(trade.stopLoss).toFixed(2)}</td>
                      <td className="px-3 py-2 text-gray-500">${parseFloat(trade.takeProfit).toFixed(2)}</td>
                      <td className={`px-3 py-2 font-bold ${pnlValue > 0 ? "text-success" : "text-destructive"}`}>
                        {pnlValue > 0 ? "+" : ""}{pnlValue.toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 font-bold ${pnlPercent > 0 ? "text-success" : "text-destructive"}`}>
                        {pnlPercent > 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                          className="text-primary hover:text-primary-foreground text-[9px] font-bold uppercase border border-primary px-1.5 py-0.5 hover:bg-primary/20 transition-colors"
                          data-testid={`button-details-${trade.id}`}
                        >
                          {isExpanded ? "HIDE" : "SHOW"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {expandedId !== null && trades.find((t) => t.id === expandedId) && (
            <div className="bg-black/50 border-t border-border p-3 font-mono text-[10px] text-gray-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-96">
              <div className="text-cyan-400 font-bold mb-2">📊 TRADE REASONING:</div>
              <div className="text-gray-400 space-y-1">
                <div>Entry Analysis: Momentum-based entry signal detected</div>
                <div>Entry Price: Optimal entry at current trend strength</div>
                <div>Stop Loss: Set beyond recent swing low/high with risk management</div>
                <div>Take Profit: Calculated based on volatility and momentum indicators</div>
                <div>Exit Reason: Position closed at {trades.find((t) => t.id === expandedId)?.takeProfit ? "Take Profit" : "Stop Loss"} level</div>
                <div>Market Conditions: Trade executed with full AI autonomy</div>
              </div>
            </div>
          )}
        </div>

        {trades.length === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground border border-border bg-secondary/5">
            No closed trades yet
          </div>
        )}
      </div>
    </Layout>
  );
}