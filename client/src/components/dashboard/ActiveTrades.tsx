import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";

const TRADES = [
  {
    id: "T-1023",
    pair: "BTC/USDT",
    side: "Long",
    entry: 96450.00,
    current: 97120.50,
    leverage: "20x",
    pnl: "+14.5%",
    pnlValue: "+$420.50",
    status: "Active",
    platform: "Binance"
  },
  {
    id: "T-1024",
    pair: "ETH/USDT",
    side: "Short",
    entry: 3450.20,
    current: 3420.10,
    leverage: "10x",
    pnl: "+8.2%",
    pnlValue: "+$150.20",
    status: "Active",
    platform: "Bybit"
  },
  {
    id: "T-1025",
    pair: "SOL/USDT",
    side: "Long",
    entry: 145.20,
    current: 143.80,
    leverage: "5x",
    pnl: "-1.4%",
    pnlValue: "-$45.00",
    status: "Active",
    platform: "Binance"
  },
];

export function ActiveTrades() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Active Positions</h3>
        <Badge variant="secondary" className="font-mono text-xs">3 Open</Badge>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-3">Pair</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Entry</th>
              <th className="px-4 py-3">Current</th>
              <th className="px-4 py-3">PnL</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TRADES.map((trade) => (
              <tr key={trade.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{trade.pair}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{trade.leverage}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{trade.platform}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={trade.side === "Long" ? "text-success font-medium" : "text-destructive font-medium"}>
                    {trade.side}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono">${trade.entry.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">${trade.current.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className={trade.pnl.startsWith("+") ? "text-success font-bold font-mono" : "text-destructive font-bold font-mono"}>
                    {trade.pnl}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{trade.pnlValue}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 hover:bg-secondary rounded text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}