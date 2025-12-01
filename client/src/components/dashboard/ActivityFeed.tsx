import { Terminal, Zap } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

type LogType = "ENTRY" | "EXIT" | "ANALYSIS" | "SCAN" | "HOLD" | "HFT";

interface Log {
  id: number;
  timestamp: Date;
  logType: string;
  message: string;
  pair?: string;
  pnl?: number;
}

export function ActivityFeed() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [flashingIds, setFlashingIds] = useState<Set<number>>(new Set());
  const seenIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs?limit=20");
        const data = await res.json();
        
        // Parse PnL from message for EXIT logs
        const logsWithPnL = data.map((log: any) => {
          if (log.logType === "EXIT") {
            const pnlMatch = log.message.match(/PnL:\s*([-+]?[\d.]+)/);
            if (pnlMatch) {
              return { ...log, pnl: parseFloat(pnlMatch[1]) };
            }
          }
          return log;
        });

        const reversedLogs = logsWithPnL.reverse();
        
        // Trigger flash for new EXIT logs with PnL
        reversedLogs.forEach((log) => {
          if (log.logType === "EXIT" && log.pnl !== undefined && !seenIds.current.has(log.id)) {
            seenIds.current.add(log.id);
            setFlashingIds((prev) => new Set([...prev, log.id]));
          }
        });

        setLogs(reversedLogs);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLogTypeColor = (type: string): string => {
    switch (type.toUpperCase()) {
      case "ENTRY":
        return "text-green-400";
      case "EXIT":
        return "text-orange-400";
      case "ANALYSIS":
        return "text-purple-400";
      case "SCAN":
        return "text-blue-400";
      case "HOLD":
        return "text-yellow-400";
      case "HFT":
        return "text-cyan-400";
      default:
        return "text-gray-400";
    }
  };

  const formatTradeLog = (logType: string, message: string): string => {
    const firstLine = message.split('\n')[0];
    
    if (logType === "ENTRY") {
      // Parse format: [MODE] SIDE PAIR @ $PRICE
      // Example: [HFT SCALPER] LONG BTCUSDT @ $45000 | 20x Leverage...
      const match = firstLine.match(/\[.*?\]\s+(\w+)\s+(\w+)\s+@\s+\$([0-9.]+)/);
      if (match) {
        const side = match[1].toLowerCase();
        const pair = match[2];
        const price = parseFloat(match[3]);
        return `AI opened ${side} on ${pair} pair at ${formatPrice(price)}`;
      }
      return firstLine;
    } else if (logType === "EXIT") {
      // Check if manually closed
      if (firstLine.includes("closed by user") || firstLine.toLowerCase().includes("manual")) {
        const match = firstLine.match(/(\w+)\s+(\w+)\s+CLOSED/);
        if (match) {
          const side = match[1].toLowerCase();
          return `Manually closed ${side}`;
        }
        return "Manually closed position";
      }
      // Parse format: SIDE PAIR CLOSED | Exit: $PRICE | PnL: 123.45 (12.34%)
      const match = firstLine.match(/(\w+)\s+(\w+)\s+CLOSED.*?PnL:\s*([-+]?[0-9.]+)\s*\(([^)]+)\)/);
      if (match) {
        const side = match[1].toLowerCase();
        const pair = match[2];
        const pnl = parseFloat(match[3]);
        const pnlPercent = match[4];
        return `AI closed ${side} on ${pair} pair with ${formatPrice(pnl)} PnL (${pnlPercent})`;
      }
      // Fallback if PnL not found
      const fallbackMatch = firstLine.match(/(\w+)\s+(\w+)\s+CLOSED/);
      if (fallbackMatch) {
        const side = fallbackMatch[1].toLowerCase();
        const pair = fallbackMatch[2];
        return `AI closed ${side} on ${pair} pair`;
      }
      return firstLine;
    }
    
    return firstLine;
  };

  return (
    <div className="bg-background border border-border h-full flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3" />
          <h3 className="font-bold text-foreground uppercase tracking-wider">TRADE LOGS HISTORY</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-[10px] text-muted-foreground">PROCESSING</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0 tech-scroll bg-black text-green-500">
        {logs.length === 0 ? (
          <div className="px-3 py-4 text-gray-500 italic">Waiting for AI decisions...</div>
        ) : (
          logs.map((log, index) => {
            const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              fractionalSecondDigits: 3,
            });

            // Determine if this should flash
            const isExit = log.logType === "EXIT";
            const shouldFlash = isExit && log.pnl !== undefined && flashingIds.has(log.id);
            const isProfit = log.pnl && log.pnl > 0;

            const formattedMessage = formatTradeLog(log.logType, log.message);

            // Add permanent background for EXIT logs based on PnL
            const hasPermanentBg = isExit && log.pnl !== undefined;
            const permanentBgColor = isProfit ? "bg-green-500/15" : "bg-red-500/15";

            return (
              <div
                key={log.id}
                className={cn(
                  "px-3 py-1.5 hover:bg-white/5 border-b border-white/5 last:border-0",
                  hasPermanentBg && permanentBgColor,
                  shouldFlash && (isProfit ? "flash-profit" : "flash-loss")
                )}
                data-testid={`activity-log-${index}`}
                onAnimationEnd={() => {
                  setFlashingIds((prev) => {
                    const updated = new Set(prev);
                    updated.delete(log.id);
                    return updated;
                  });
                }}
              >
                <div className="text-gray-300 text-[10px] leading-relaxed pl-0">
                  <span className={cn("font-bold", getLogTypeColor(log.logType))}>{log.logType}</span> <span className="text-gray-500">[{time}]</span> {formattedMessage}
                </div>
              </div>
            );
          })
        )}
        <div className="px-3 py-1.5 text-gray-500 italic animate-pulse flex items-center gap-2">
          <Zap className="w-3 h-3" />
          calculating_fee_spreads...
        </div>
      </div>
    </div>
  );
}
