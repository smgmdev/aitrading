import { Terminal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type LogType = "ENTRY" | "EXIT" | "ANALYSIS" | "SCAN" | "HOLD" | "HFT";

interface Log {
  id: number;
  timestamp: Date;
  logType: string;
  message: string;
  pair?: string;
}

export function ActivityFeed() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs?limit=20");
        const data = await res.json();
        setLogs(data.reverse());
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
            return (
              <div
                key={log.id}
                className="flex gap-3 px-3 py-1.5 hover:bg-white/5 border-b border-white/5 last:border-0"
                data-testid={`activity-log-${index}`}
              >
                <div className="text-gray-500 min-w-[90px] select-none">{time}</div>
                <div className={cn("font-bold min-w-[60px]", getLogTypeColor(log.logType))}>
                  {log.logType}
                </div>
                <div className="text-gray-300 flex-1">{log.message}</div>
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
