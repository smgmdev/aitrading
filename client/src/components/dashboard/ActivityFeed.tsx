import { Terminal, Search, ShieldAlert, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGS = [
  { id: 1, time: "11:02:45.123", type: "SCAN", message: "Scanning 45 pairs for volatility patterns..." },
  { id: 2, time: "11:03:12.005", type: "SIGNAL", message: "BTC/USDT RSI Divergence detected on 15m timeframe." },
  { id: 3, time: "11:03:15.442", type: "EXEC", message: "LONG BTC/USDT @ 97,200 | Lev: 20x | Size: 1.5 BTC" },
  { id: 4, time: "11:03:15.889", type: "ORDER", message: "Order #88239912 FILLED. Slippage: 0.01%" },
  { id: 5, time: "11:05:00.100", type: "RISK", message: "Adjusting trailing Stop Loss to 96,800." },
  { id: 6, time: "11:06:22.550", type: "INFO", message: "Sentiment Analysis: NEUTRAL-BULLISH (0.65)" },
];

export function ActivityFeed() {
  return (
    <div className="bg-background border border-border h-full flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2">
           <Terminal className="w-3 h-3" />
           <h3 className="font-bold text-foreground uppercase tracking-wider">System Logs</h3>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
           <span className="text-[10px] text-muted-foreground">LIVE STREAM</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0 tech-scroll bg-black text-green-500">
        {LOGS.map((log, index) => (
          <div key={log.id} className="flex gap-3 px-3 py-1.5 hover:bg-white/5 border-b border-white/5 last:border-0">
             <div className="text-gray-500 min-w-[90px] select-none">{log.time}</div>
             <div className={cn(
               "font-bold min-w-[50px]",
               log.type === 'SCAN' && "text-blue-400",
               log.type === 'SIGNAL' && "text-yellow-400",
               log.type === 'EXEC' && "text-green-400",
               log.type === 'ORDER' && "text-white",
               log.type === 'RISK' && "text-red-400",
               log.type === 'INFO' && "text-gray-400",
             )}>{log.type}</div>
             <div className="text-gray-300 flex-1">{log.message}</div>
          </div>
        ))}
        <div className="px-3 py-1.5 text-gray-500 italic animate-pulse">
           _cursor_active
        </div>
      </div>
    </div>
  );
}