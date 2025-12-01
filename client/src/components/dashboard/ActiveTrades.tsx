import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TRADES = [
  {
    id: "T-1023",
    pair: "BTC/USDT",
    side: "LONG",
    entry: 96450.00,
    current: 97120.50,
    leverage: "20x",
    pnl: 14.5,
    pnlValue: 420.50,
    status: "OPEN",
    platform: "BINANCE"
  },
  {
    id: "T-1024",
    pair: "ETH/USDT",
    side: "SHORT",
    entry: 3450.20,
    current: 3420.10,
    leverage: "10x",
    pnl: 8.2,
    pnlValue: 150.20,
    status: "OPEN",
    platform: "BYBIT"
  },
  {
    id: "T-1025",
    pair: "SOL/USDT",
    side: "LONG",
    entry: 145.20,
    current: 143.80,
    leverage: "5x",
    pnl: -1.4,
    pnlValue: -45.00,
    status: "OPEN",
    platform: "BINANCE"
  },
];

export function ActiveTrades() {
  return (
    <div className="bg-background border border-border h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/10">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Open Positions</h3>
        <span className="text-xs font-mono text-muted-foreground">EXPOSURE: $15,420.00</span>
      </div>
      
      <div className="flex-1 overflow-auto tech-scroll">
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
            {TRADES.map((trade) => (
              <tr key={trade.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-2.5 font-bold text-foreground">{trade.pair}</td>
                <td className="px-4 py-2.5">
                   <span className={cn(
                     "px-1.5 py-0.5 text-[10px] font-bold border",
                     trade.side === "LONG" 
                       ? "text-success border-success bg-success/10" 
                       : "text-destructive border-destructive bg-destructive/10"
                   )}>
                     {trade.side}
                   </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">${trade.entry.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="px-4 py-2.5 text-foreground font-medium">${trade.current.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="px-4 py-2.5 text-warning">{trade.leverage}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className={cn("font-bold", trade.pnl > 0 ? "text-success" : "text-destructive")}>
                    {trade.pnl > 0 ? '+' : ''}{trade.pnl}%
                  </div>
                  <div className={cn("text-[10px]", trade.pnl > 0 ? "text-success/70" : "text-destructive/70")}>
                    {trade.pnl > 0 ? '+' : ''}{trade.pnlValue.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button className="text-primary hover:text-primary-foreground hover:bg-primary px-2 py-1 border border-primary transition-colors text-[10px] font-bold uppercase">
                    Close
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