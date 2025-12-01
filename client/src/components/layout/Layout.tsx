import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Activity, 
  LogOut,
  Bell
} from "lucide-react";
import { cn, formatPrice, formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ConnectionStatus = "live" | "testnet" | "disconnected";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [connectedExchange, setConnectedExchange] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [latency, setLatency] = useState<number>(0);
  const [equity, setEquity] = useState<number>(10000);
  const [previousEquity, setPreviousEquity] = useState<number>(10000);
  const [equityChange, setEquityChange] = useState<number>(0);
  const [showEquityChange, setShowEquityChange] = useState<boolean>(false);
  const [pnl24h, setPnl24h] = useState<number>(0);
  const [winRatio, setWinRatio] = useState<string>("0%");
  const [totalTrades, setTotalTrades] = useState<number>(0);
  const [showTradeLogsConsole, setShowTradeLogsConsole] = useState<boolean>(false);
  const [showAiBrainEngine, setShowAiBrainEngine] = useState<boolean>(false);
  const [tradeLogs, setTradeLogs] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      try {
        // Fetch exchange connection
        const res = await fetch("/api/exchange/connected");
        const endTime = Date.now();
        setLatency(endTime - startTime);
        
        const data = await res.json();
        setConnectedExchange(data.connected);
        
        if (data.connected) {
          setConnectionStatus("live");
        } else {
          setConnectionStatus("disconnected");
        }

        // Fetch closed positions for PnL calculation
        const closedRes = await fetch("/api/positions/closed?limit=200");
        if (closedRes.ok) {
          const closedPositions = await closedRes.json();
          
          if (Array.isArray(closedPositions)) {
            // Calculate 24H PnL
            const now = Date.now();
            const oneDayAgo = now - 24 * 60 * 60 * 1000;
            
            let pnl24hSum = 0;
            let winCount = 0;
            
            closedPositions.forEach((pos: any) => {
              const exitTime = pos.exitTime ? new Date(pos.exitTime).getTime() : 0;
              const pnl = parseFloat(pos.pnl || "0");
              
              if (exitTime >= oneDayAgo) {
                pnl24hSum += pnl;
              }
              
              if (pnl > 0) {
                winCount++;
              }
            });
            
            setPnl24h(pnl24hSum);
            const ratio = closedPositions.length > 0 ? Math.round((winCount / closedPositions.length) * 100) : 0;
            setWinRatio(`${ratio}%`);
            setTotalTrades(closedPositions.length);
            
            const newEquity = 10000 + pnl24hSum;
            if (newEquity !== equity) {
              const change = newEquity - equity;
              setEquityChange(change);
              setShowEquityChange(true);
              setEquity(newEquity);
              
              // Hide the change display after 10 seconds
              const timer = setTimeout(() => {
                setShowEquityChange(false);
              }, 10000);
              return () => clearTimeout(timer);
            }
            setTradeLogs(closedPositions);
          }
        }

        // Fetch AI logs
        const logsRes = await fetch("/api/logs?limit=100");
        if (logsRes.ok) {
          const logs = await logsRes.json();
          if (Array.isArray(logs)) {
            setAiLogs(logs);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setConnectionStatus("disconnected");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "TERMINAL", href: "/" },
    { icon: History, label: "EXECUTION LOGS", href: "/history" },
    { icon: Activity, label: "ALGO CONFIG", href: "/strategies" },
    { icon: Settings, label: "EXCHANGE CONFIG", href: "/settings" },
  ];

  const statusColor = connectionStatus === "live" ? "bg-success" : connectionStatus === "testnet" ? "bg-warning" : "bg-destructive";
  const statusLabel = connectionStatus === "live" ? "LIVE" : connectionStatus === "testnet" ? "TESTNET" : "NOT CONNECTED";
  
  const statusTooltip = connectionStatus === "live" 
    ? "LIVE - Connected to real account and trading." 
    : connectionStatus === "testnet" 
      ? "TESTNET - Connected to an exchange in demo mode." 
      : "NOT CONNECTED - Offline, not connected to any exchange.";

  const exchangeLabel = connectedExchange === "BINANCE" ? "Binance connected" : connectedExchange === "BYBIT" ? "Bybit connected" : "Exchange not connected";

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans text-sm flex-col">
        {/* Top Bar with Console Toggles */}
        <div className="h-7 border-b border-border flex items-center px-4 gap-2" style={{ backgroundColor: "#f7cea0" }}>
          <button
            onClick={() => setShowTradeLogsConsole(!showTradeLogsConsole)}
            data-testid="button-toggle-trade-logs"
            className={cn(
              "px-3 py-1 text-[10px] font-mono uppercase transition-colors border",
              showTradeLogsConsole
                ? "bg-primary text-black border-primary"
                : "bg-transparent text-foreground border-border hover:bg-secondary/50 hover:border-foreground"
            )}
          >
            TRADE LOGS CONSOLE
          </button>
          <button
            onClick={() => setShowAiBrainEngine(!showAiBrainEngine)}
            data-testid="button-toggle-ai-brain"
            className={cn(
              "px-3 py-1 text-[10px] font-mono uppercase transition-colors border",
              showAiBrainEngine
                ? "bg-primary text-black border-primary"
                : "bg-transparent text-foreground border-border hover:bg-secondary/50 hover:border-foreground"
            )}
          >
            AI BRAIN ENGINE
          </button>
        </div>

        {/* Trade Logs Console */}
        {showTradeLogsConsole && (
          <div className="h-48 border-b border-border bg-white overflow-y-auto">
            <div className="p-3 text-[9px] font-mono">
              <div className="text-black mb-2 uppercase font-bold">Trade Logs:</div>
              <div className="space-y-1">
                {tradeLogs.length === 0 ? (
                  <div className="text-gray-600">No trades yet</div>
                ) : (
                  tradeLogs.slice(0, 30).map((log: any, idx: number) => {
                    const timestamp = log.exitTime ? new Date(log.exitTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";
                    const pnlNumber = parseFloat(log.pnl || 0);
                    return (
                      <div key={idx} className="text-black text-[8px]">
                        <span className="text-gray-500">[{timestamp}]</span> <span className="text-blue-600">{log.pair}</span> {log.side === "LONG" ? "🔵" : "🔴"} {formatPrice(parseFloat(log.exitPrice || log.entryPrice))} <span className={pnlNumber >= 0 ? "text-green-600" : "text-red-600"}>{pnlNumber >= 0 ? "✓" : "✗"} {formatPrice(pnlNumber)}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Brain Engine Console */}
        {showAiBrainEngine && (
          <div className="h-96 border-b border-border bg-background overflow-y-auto">
            <div className="p-3 text-[9px] font-mono">
              <div className="text-muted-foreground mb-3 uppercase font-bold">AI Brain Engine - Analytical Decision Log:</div>
              <div className="space-y-4">
                {aiLogs.length === 0 ? (
                  <div className="text-muted-foreground">Waiting for AI to think...</div>
                ) : (
                  aiLogs.slice(0, 50).reverse().map((log: any, idx: number) => {
                    const logColor = log.logType === "ENTRY" ? "text-success" : 
                                    log.logType === "EXIT" ? "text-warning" :
                                    log.logType === "ANALYSIS" ? "text-foreground" :
                                    log.logType === "DECISION" ? "text-foreground" :
                                    "text-foreground";
                    const timestamp = log.createdAt ? new Date(log.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";
                    
                    return (
                      <div key={idx} className={cn("border border-border/50 p-2 bg-background/50", logColor)}>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                          <span className="text-muted-foreground">[{timestamp}]</span>
                          <span className={cn("px-1.5 py-0.5 bg-background text-[8px] font-bold uppercase tracking-wider", logColor)}>
                            {log.logType}
                          </span>
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-[8.5px] leading-relaxed text-foreground overflow-x-hidden">
                          {log.message}
                        </pre>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="h-8 border-b border-border flex items-center justify-between px-4 bg-black overflow-x-auto">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase">
              <span>LATENCY: {latency}MS</span>
            </div>
            <div className="h-3 w-px bg-border"></div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase cursor-help">
                  <span className={cn("w-2 h-2 rounded-full", statusColor)}></span>
                  <span>{statusLabel}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black border border-border text-white text-[9px]">
                <p>{statusTooltip}</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-3 w-px bg-border"></div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase cursor-help">
                  <span>{exchangeLabel}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black border border-border text-white text-[9px]">
                <p>Available exchanges to connect to: Bybit and Binance.</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-3 w-px bg-border"></div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase cursor-help">
                  <span className={showEquityChange ? "blink-equity" : ""}>EQUITY: {formatPrice(equity)}</span>
                  {showEquityChange && (
                    <span className={cn("font-bold ml-1", equityChange >= 0 ? "text-success" : "text-destructive")}>
                      {equityChange >= 0 ? "↑" : "↓"} {formatPrice(equityChange)}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black border border-border text-white text-[9px]">
                <p>Futures trading account balance of the connected exchange.</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-3 w-px bg-border"></div>
            <div className={cn("flex items-center gap-1 text-[10px] font-mono uppercase", pnl24h >= 0 ? "text-success" : "text-destructive")}>
              <span>24H PNL: {pnl24h >= 0 ? formatPrice(pnl24h) : formatPrice(pnl24h)}</span>
            </div>
            <div className="h-3 w-px bg-border"></div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase cursor-help">
                  <span>WIN RATIO: {winRatio} / {totalTrades}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black border border-border text-white text-[9px]">
                <p>Trades which closed in profit after fees are considered winning trades.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-1 hover:bg-secondary border border-transparent hover:border-border transition-colors">
              <Bell className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        {/* Horizontal Navigation */}
        <nav className="h-10 border-b border-border bg-background flex items-center px-4 gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors cursor-pointer border-b-2 -mb-0.5 h-full flex items-center",
                  isActive 
                    ? "bg-secondary border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}>
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Main Content Area with Left Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - AI Decision Stream */}
          <aside className="w-80 border-r border-border bg-sidebar flex flex-col overflow-hidden">
            <ActivityFeed />
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-secondary/10 p-4">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
