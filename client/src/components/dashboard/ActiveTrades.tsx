import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TRADES = [
  {
    id: "T-1023",
    pair: "BTC/USDT",
    side: "Long",
    entry: 96450.00,
    current: 97120.50,
    leverage: "20x",
    pnl: 14.5,
    pnlValue: 420.50,
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
    pnl: 8.2,
    pnlValue: 150.20,
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
    pnl: -1.4,
    pnlValue: -45.00,
    status: "Active",
    platform: "Binance"
  },
];

export function ActiveTrades() {
  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-gray-900">Active Positions</h3>
        <button className="text-sm text-blue-500 font-medium hover:text-blue-600 transition-colors">View All</button>
      </div>
      
      <div className="flex-1 overflow-x-auto thin-scroll">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pl-2">Pair</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">PnL</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {TRADES.map((trade) => (
              <tr key={trade.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {trade.pair.split('/')[0].substring(0,1)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{trade.pair}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          trade.side === "Long" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {trade.side}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {trade.leverage}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                   <div className="text-sm font-medium text-gray-900">${trade.current.toLocaleString()}</div>
                   <div className="text-xs text-gray-400">Entry: ${trade.entry.toLocaleString()}</div>
                </td>
                <td className="py-4">
                  <div className={cn("text-sm font-bold flex items-center gap-1", trade.pnl > 0 ? "text-green-600" : "text-red-600")}>
                    {trade.pnl > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(trade.pnl)}%
                  </div>
                  <div className={cn("text-xs font-medium mt-0.5", trade.pnl > 0 ? "text-green-600/70" : "text-red-600/70")}>
                    {trade.pnl > 0 ? '+' : '-'}${Math.abs(trade.pnlValue).toFixed(2)}
                  </div>
                </td>
                <td className="py-4 text-right pr-2">
                  <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
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