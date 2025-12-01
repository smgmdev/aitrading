import { useEffect, useState } from "react";

export function TradeLogs() {
  const [tradeLogs, setTradeLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchTradeLogs = async () => {
      try {
        const res = await fetch("/api/positions/closed?limit=50");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTradeLogs(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch trade logs:", error);
      }
    };

    fetchTradeLogs();
    const interval = setInterval(fetchTradeLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black border border-border h-full flex flex-col">
      <div className="p-3 text-[9px] font-mono flex-1 overflow-y-auto">
        <div className="text-muted-foreground mb-2 uppercase font-bold">Trade Logs Console:</div>
        <div className="space-y-1">
          {tradeLogs.length === 0 ? (
            <div className="text-muted-foreground">No trades yet</div>
          ) : (
            tradeLogs.slice(0, 50).map((log: any, idx: number) => {
              const timestamp = log.exitTime ? new Date(log.exitTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";
              const pnlNumber = parseFloat(log.pnl || 0);
              return (
                <div key={idx} className="text-foreground text-[8px]">
                  <span className="text-muted-foreground">[{timestamp}]</span> <span className="text-cyan-400">{log.pair}</span> {log.side === "LONG" ? "🔵" : "🔴"} ${parseFloat(log.exitPrice || log.entryPrice).toFixed(2)} <span className={pnlNumber >= 0 ? "text-success" : "text-destructive"}>{pnlNumber >= 0 ? "✓" : "✗"} {pnlNumber >= 0 ? "+" : ""}{pnlNumber.toFixed(2)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
