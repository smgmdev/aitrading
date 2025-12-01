import { Terminal, Search, ShieldAlert, ArrowRight, AlertTriangle, Crosshair, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGS = [
  { id: 1, time: "11:03:08.005", type: "HFT", message: "ETH/USDT: Micro-opportunity detected. Fee spread covered." },
  { id: 2, time: "11:03:08.112", type: "EXEC", message: "LONG ETH/USDT @ 3450.20 | Lev: 80x (Quick Scalp)" },
  { id: 3, time: "11:03:15.442", type: "EXIT", message: "CLOSED ETH/USDT @ 3452.80 (+0.08% net) in 7.3s" },
  { id: 4, time: "11:03:20.115", type: "SCAN", message: "Scanning 5m structures for swing setups..." },
  { id: 5, time: "11:03:22.550", type: "ANALYSIS", message: "BTC/USDT: 15m Bull Flag confirmed. Preparing Swing Entry." },
  { id: 6, time: "11:03:23.000", type: "HOLD", message: "SOL/USDT: Holding LONG. Targeting 12m duration." },
];

export function ActivityFeed() {
  return (
    <div className="bg-background border border-border h-full flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2">
           <Terminal className="w-3 h-3" />
           <h3 className="font-bold text-foreground uppercase tracking-wider">AI Decision Stream</h3>
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
               log.type === 'HFT' && "text-cyan-400",
               log.type === 'EXEC' && "text-green-400",
               log.type === 'EXIT' && "text-orange-400",
               log.type === 'SCAN' && "text-blue-400",
               log.type === 'ANALYSIS' && "text-purple-400",
               log.type === 'HOLD' && "text-yellow-400",
             )}>{log.type}</div>
             <div className="text-gray-300 flex-1">{log.message}</div>
          </div>
        ))}
        <div className="px-3 py-1.5 text-gray-500 italic animate-pulse flex items-center gap-2">
           <Zap className="w-3 h-3" />
           calculating_fee_spreads...
        </div>
      </div>
    </div>
  );
}