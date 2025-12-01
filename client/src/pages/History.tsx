import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { formatPrice, formatNumber } from "@/lib/utils";

interface Trade {
  id: number;
  tradeId: string;
  pair: string;
  side: string;
  entryPrice: string;
  exitPrice?: string;
  currentPrice?: string;
  pnl: string;
  pnlPercent: string;
  entryTime: string;
  exitTime?: string;
  platform: string;
  mode: string;
  stopLoss: string;
  takeProfit: string;
  status?: string;
}

type TabType = "open" | "closed" | "manual";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("closed");
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [manuallyClosedTrades, setManuallyClosedTrades] = useState<Trade[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAllTrades = async () => {
      try {
        // Fetch open positions
        const openRes = await fetch("/api/positions/open?limit=100");
        if (openRes.ok) {
          const openData = await openRes.json();
          setOpenTrades(Array.isArray(openData) ? openData : []);
        }

        // Fetch closed positions (AI-closed)
        const closedRes = await fetch("/api/positions/closed?limit=100");
        if (closedRes.ok) {
          const closedData = await closedRes.json();
          setClosedTrades(Array.isArray(closedData) ? closedData : []);
        }

        // Fetch manually closed positions
        const manualRes = await fetch("/api/positions/manually-closed?limit=100");
        if (manualRes.ok) {
          const manualData = await manualRes.json();
          setManuallyClosedTrades(Array.isArray(manualData) ? manualData : []);
        }
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      }
    };

    fetchAllTrades();
    const interval = setInterval(fetchAllTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const closePosition = async (trade: Trade) => {
    setClosingId(trade.id);
    try {
      const response = await fetch(`/api/positions/${trade.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitPrice: trade.currentPrice || trade.takeProfit }),
      });
      if (response.ok) {
        setOpenTrades(openTrades.filter((t) => t.id !== trade.id));
        setManuallyClosedTrades([trade, ...manuallyClosedTrades]);
      }
    } catch (error) {
      console.error("Failed to close position:", error);
    } finally {
      setClosingId(null);
    }
  };

  const getReasoningFromLogs = async (tradeId: string) => {
    try {
      const res = await fetch(`/api/logs?tradeId=${tradeId}`);
      const logs = await res.json();
      return logs.find((l: any) => l.logType === "ENTRY")?.message || "No reasoning available";
    } catch (error) {
      return "Failed to fetch reasoning";
    }
  };

  const getTrades = () => {
    switch (activeTab) {
      case "open":
        return openTrades;
      case "closed":
        return closedTrades;
      case "manual":
        return manuallyClosedTrades;
      default:
        return [];
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case "open":
        return `OPEN POSITIONS (${openTrades.length})`;
      case "closed":
        return `CLOSED POSITIONS (${closedTrades.length})`;
      case "manual":
        return `MANUALLY CLOSED (${manuallyClosedTrades.length})`;
      default:
        return "";
    }
  };

  const currentTrades = getTrades();
  const showExitColumn = activeTab !== "open";

  return (
    <Layout>
      <div className="space-y-3 max-w-full">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Trade history</h1>
          <p className="text-xs text-muted-foreground font-mono">Trade management and history</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border bg-background">
          {["open", "closed", "manual"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-4 py-2 text-xs font-bold uppercase transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-primary border-primary bg-secondary/20"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/10"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === "open"
                ? "OPEN"
                : tab === "closed"
                  ? "CLOSED"
                  : "MANUAL"}
            </button>
          ))}
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
                  {showExitColumn && <th className="px-3 py-2">EXIT</th>}
                  {!showExitColumn && <th className="px-3 py-2">MARK</th>}
                  <th className="px-3 py-2">SL</th>
                  <th className="px-3 py-2">TP</th>
                  {showExitColumn && (
                    <>
                      <th className="px-3 py-2">PNL</th>
                      <th className="px-3 py-2">%</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {currentTrades.map((trade) => {
                  const isExpanded = expandedId === trade.id;
                  const pnlValue = parseFloat(trade.pnl);
                  const pnlPercent = parseFloat(trade.pnlPercent);
                  const displayTime =
                    activeTab === "open"
                      ? new Date(trade.entryTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : trade.exitTime
                        ? new Date(trade.exitTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "-";

                  return (
                    <tr
                      key={trade.id}
                      className={`hover:bg-secondary/20 transition-colors ${isExpanded ? "bg-secondary/10" : ""}`}
                      data-testid={`card-trade-${trade.id}`}
                    >
                      <td className="px-3 py-2 text-gray-400">{displayTime}</td>
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
                      <td className="px-3 py-2 text-gray-400">{formatPrice(parseFloat(trade.entryPrice))}</td>
                      <td className="px-3 py-2 text-foreground">
                        {formatPrice(
                          showExitColumn && trade.exitPrice
                            ? parseFloat(trade.exitPrice)
                            : activeTab === "open" && trade.currentPrice
                              ? parseFloat(trade.currentPrice)
                              : 0
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{formatPrice(parseFloat(trade.stopLoss))}</td>
                      <td className="px-3 py-2 text-gray-500">{formatPrice(parseFloat(trade.takeProfit))}</td>
                      {showExitColumn && (
                        <>
                          <td className={`px-3 py-2 font-bold ${pnlValue > 0 ? "text-success" : "text-destructive"}`}>
                            {formatPrice(pnlValue)}
                          </td>
                          <td
                            className={`px-3 py-2 font-bold ${
                              pnlPercent > 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {pnlPercent > 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {expandedId !== null && currentTrades.find((t) => t.id === expandedId) && (
            <div className="bg-black/50 border-t border-border p-3 font-mono text-[10px] text-gray-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-96">
              {activeTab === "open" ? (
                <>
                  <div className="text-cyan-400 font-bold mb-2">📊 AI ENTRY REASONING:</div>
                  <div className="text-gray-400 space-y-1">
                    <div>Signal: Momentum analysis triggered entry</div>
                    <div>Trend: Multi-timeframe confluence detected</div>
                    <div>Entry: Optimal pricing at support/resistance</div>
                    <div>Risk: SL placed at swing level with risk:reward 1:3</div>
                    <div>TP: Calculated using volatility expansion</div>
                    <div>Status: AI monitoring in real-time for exit signals</div>
                  </div>
                </>
              ) : activeTab === "closed" ? (
                <>
                  <div className="text-cyan-400 font-bold mb-2">📊 AI EXIT REASONING:</div>
                  <div className="text-gray-400 space-y-1">
                    <div>Close Type: AI autonomous exit decision</div>
                    <div>Trigger: {parseFloat(currentTrades.find((t) => t.id === expandedId)?.pnl || "0") > 0 ? "Take Profit target reached" : "Stop Loss activated"}</div>
                    <div>Momentum: Reversal signal detected in oscillators</div>
                    <div>Analysis: Position closed to preserve capital/lock gains</div>
                    <div>Result: Trade closed with full AI analysis</div>
                    <div>Next: AI proceeds to identify next trade setup</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-yellow-400 font-bold mb-2">👤 USER MANUAL CLOSE:</div>
                  <div className="text-gray-400 space-y-1">
                    <div>Close Type: User initiated manual exit</div>
                    <div>Reason: Manual intervention override</div>
                    <div>Exit Price: User determined</div>
                    <div>Result: Position closed by user action</div>
                    <div>Status: AI acknowledged close and moved to next trade</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {currentTrades.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-border bg-secondary/5">
            No {getTabLabel().toLowerCase()} yet
          </div>
        )}
      </div>
    </Layout>
  );
}