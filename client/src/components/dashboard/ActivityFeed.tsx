import { Terminal, Search, ShieldAlert, ArrowRight, AlertTriangle, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGS = [
  { id: 1, time: "11:03:10.005", type: "SCAN", message: "Scanning Top 20 Volatility Pairs (Binance Futures)..." },
  { id: 2, time: "11:03:10.220", type: "ANALYSIS", message: "SOL/USDT: Fake pump detected on 1m. Avoiding." },
  { id: 3, time: "11:03:11.442", type: "SIGNAL", message: "BTC/USDT: Clean breakdown structure on 5m. Validating..." },
  { id: 4, time: "11:03:12.115", type: "CALC", message: "Risk: 0.8% | Optimal Lev: 45x | SL: Tight | TP: 1.2R" },
  { id: 5, time: "11:03:12.550", type: "EXEC", message: "SHORT BTC/USDT @ Market. Size: 2.5 BTC" },
  { id: 6, time: "11:03:15.000", type: "PROTECT", message: "Monitoring for liquidity grab wicks..." },
];

export function ActivityFeed() {
  return (
    <div className="bg-background border border-border h-full flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2">
           <Terminal className="w-3 h-3" />
           <h3 className="font-bold text-foreground uppercase tracking-wider">AI Logic Stream</h3>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
           <span className="text-[10px] text-muted-foreground">PROCESSING</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0 tech-scroll bg-black text-green-500">
        {LOGS.map((log, index) => (
          <div key={log.id} className="flex gap-3 px-3 py-1.5 hover:bg-white/5 border-b border-white/5 last:border-0">
             <div className="text-gray-500 min-w-[90px] select-none">{log.time}</div>
             <div className={cn(
               "font-bold min-w-[60px]",
               log.type === 'SCAN' && "text-blue-400",
               log.type === 'ANALYSIS' && "text-purple-400",
               log.type === 'SIGNAL' && "text-yellow-400",
               log.type === 'EXEC' && "text-green-400",
               log.type === 'CALC' && "text-cyan-400",
               log.type === 'PROTECT' && "text-orange-400",
             )}>{log.type}</div>
             <div className="text-gray-300 flex-1">{log.message}</div>
          </div>
        ))}
        <div className="px-3 py-1.5 text-gray-500 italic animate-pulse flex items-center gap-2">
           <Crosshair className="w-3 h-3" />
           scanning_market_depth...
        </div>
      </div>
    </div>
  );
}