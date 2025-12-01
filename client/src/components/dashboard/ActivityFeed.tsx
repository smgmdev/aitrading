import { Terminal, Search, ShieldAlert, ArrowRight } from "lucide-react";

const LOGS = [
  { id: 1, time: "11:02:45", type: "scan", message: "Scanning 45 pairs for volatility patterns..." },
  { id: 2, time: "11:03:12", type: "signal", message: "BTC/USDT RSI Divergence detected on 15m." },
  { id: 3, time: "11:03:15", type: "action", message: "Executing LONG entry at 97,200. Leverage 20x." },
  { id: 4, time: "11:03:18", type: "success", message: "Order filled. ID: #88239912" },
  { id: 5, time: "11:05:00", type: "info", message: "Adjusting Stop Loss for ETH/USDT position." },
  { id: 6, time: "11:06:22", type: "scan", message: "Analyzing market sentiment from news feed..." },
];

export function ActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">AI Decision Log</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {LOGS.map((log) => (
          <div key={log.id} className="flex gap-3 items-start group">
            <div className="text-muted-foreground min-w-[60px]">{log.time}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {log.type === 'scan' && <Search className="w-3 h-3 text-primary" />}
                {log.type === 'signal' && <ShieldAlert className="w-3 h-3 text-warning" />}
                {log.type === 'action' && <ArrowRight className="w-3 h-3 text-success" />}
                <span className={`
                  ${log.type === 'success' ? 'text-success' : ''}
                  ${log.type === 'action' ? 'text-foreground font-bold' : 'text-muted-foreground'}
                `}>
                  {log.message}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div className="animate-pulse flex gap-3 items-start">
          <div className="text-muted-foreground min-w-[60px]">11:07:00</div>
          <div className="text-primary">AI Thinking...</div>
        </div>
      </div>
    </div>
  );
}