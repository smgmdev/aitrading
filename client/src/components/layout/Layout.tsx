import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Activity, 
  LogOut,
  Bell
} from "lucide-react";
import { cn, formatPrice, formatNumber, removeEmojis } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [equityBlinkColor, setEquityBlinkColor] = useState<"profit" | "loss" | null>(null);
  const [pnl24h, setPnl24h] = useState<number>(0);
  const [winRatio, setWinRatio] = useState<string>("0%");
  const [totalTrades, setTotalTrades] = useState<number>(0);
  const [showTradeLogsConsole, setShowTradeLogsConsole] = useState<boolean>(false);
  const [showAiBrainEngine, setShowAiBrainEngine] = useState<boolean>(false);
  const [tradeLogs, setTradeLogs] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);

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
              setEquityBlinkColor(change >= 0 ? "profit" : "loss");
              
              // Hide the change display after 10 seconds
              const timer = setTimeout(() => {
                setShowEquityChange(false);
                setEquityBlinkColor(null);
              }, 10000);
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

  // Helper to format prices in text (fix $-XXX to -$XXX and add commas)
  const formatPricesInText = (text: string): string => {
    // Replace $-XXX.XX with -$XXX.XX
    let formatted = text.replace(/\$(-[\d,]+\.?\d*)/g, '-$${1}');
    // Add commas to numbers (for prices and values)
    formatted = formatted.replace(/\$(\d+)\.?(\d{0,2})?(?!\d)/g, (match, num, decimals) => {
      const numWithCommas = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return decimals ? `$${numWithCommas}.${decimals}` : `$${numWithCommas}`;
    });
    // Also handle cases like "123.45" (without $) that should have commas
    formatted = formatted.replace(/(?<!\$)(\d{4,})\.(\d{2})/g, (match, num, decimals) => {
      const numWithCommas = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${numWithCommas}.${decimals}`;
    });
    return formatted;
  };

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
            <div className="p-0 text-xs font-mono">
              <div className="text-black px-3 py-2 uppercase font-bold bg-gray-50 sticky top-0">Quick Logs:</div>
              <div className="divide-y divide-gray-200">
                {tradeLogs.length === 0 ? (
                  <div className="text-gray-600 px-3 py-2">No trades yet</div>
                ) : (
                  tradeLogs.slice(0, 30).map((log: any, idx: number) => {
                    const timestamp = log.exitTime ? new Date(log.exitTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";
                    const pnlNumber = parseFloat(log.pnl || 0);
                    const modeLabel = log.mode === "HFT_SCALPER" ? "HFT" : "SWING";
                    const sideLabel = log.side === "LONG" ? "LONG" : "SHORT";
                    return (
                      <div key={idx} onClick={() => setSelectedTradeId(log.id)} className="text-black text-[10px] flex gap-3 font-mono px-3 py-2 transition-colors cursor-pointer trade-log-row">
                        <span className="text-gray-700 min-w-max">[{timestamp}]</span>
                        <span className="text-black min-w-max">{log.pair} <span className="text-gray-700">{sideLabel}</span></span>
                        <span className="text-gray-700 min-w-max">Entry: {formatPrice(parseFloat(log.entryPrice))}</span>
                        <span className="text-gray-600 min-w-max">{modeLabel}</span>
                        <span className="text-gray-700 min-w-max">Exit: {formatPrice(parseFloat(log.exitPrice))}</span>
                        <span className={cn("font-bold min-w-max", pnlNumber >= 0 ? "text-green-600" : "text-red-600")}>
                          {formatPrice(pnlNumber)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trade Details Modal */}
        {selectedTradeId !== null && (
          <Dialog open={selectedTradeId !== null} onOpenChange={(open) => {
            if (!open) setSelectedTradeId(null);
          }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Trade Logic & Reasoning</DialogTitle>
              </DialogHeader>
              {(() => {
                const trade = tradeLogs.find((t: any) => t.id === selectedTradeId);
                if (!trade) return null;

                // Find AI logs related to this specific trade
                // Match by pair name and the @ entry price pattern
                const entryPriceNum = parseFloat(trade.entryPrice);
                const entryPriceFormatted = formatPrice(entryPriceNum);
                const sideText = trade.side === "LONG" ? "LONG" : "SHORT";
                
                // Create search pattern like "ETHUSDT @ $12345.67" or "LONG ETHUSDT @ $"
                const relatedAiLogs = aiLogs.filter((log: any) => {
                  if (!log.message) return false;
                  const msg = log.message;
                  
                  // Must have pair AND @ symbol with entry price
                  const hasPairAndPrice = msg.includes(`${trade.pair} @`) && msg.includes(entryPriceFormatted);
                  return hasPairAndPrice;
                }).sort((a: any, b: any) => {
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return timeA - timeB;
                });

                const entryTime = trade.entryTime ? new Date(trade.entryTime).toLocaleString('en-US', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';
                const exitTime = trade.exitTime ? new Date(trade.exitTime).toLocaleString('en-US', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';
                const tradeDuration = trade.entryTime && trade.exitTime ? Math.round((new Date(trade.exitTime).getTime() - new Date(trade.entryTime).getTime()) / 1000) + 's' : '-';

                return (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 border border-gray-200 text-[11px] font-mono">
                      <h3 className="font-bold mb-3 uppercase">Trade Details</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="font-bold text-gray-700 mb-1">Basic Info</div>
                          <div className="grid grid-cols-2 gap-2 ml-2">
                            <div>Pair: <span className="font-bold">{trade.pair}</span></div>
                            <div>Side: <span className="font-bold">{trade.side}</span></div>
                            <div>Mode: <span className="font-bold">{trade.mode === "HFT_SCALPER" ? "HFT SCALPER" : "TECHNICAL SWING"}</span></div>
                            <div>Leverage: <span className="font-bold">{trade.leverage || 1}x</span></div>
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-gray-700 mb-1">Timing</div>
                          <div className="grid grid-cols-1 gap-1 ml-2">
                            <div>Entry Time: <span className="font-bold">{entryTime}</span></div>
                            <div>Exit Time: <span className="font-bold">{exitTime}</span></div>
                            <div>Duration: <span className="font-bold">{tradeDuration}</span></div>
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-gray-700 mb-1">Prices</div>
                          <div className="grid grid-cols-2 gap-2 ml-2">
                            <div>Entry: <span className="font-bold">{formatPrice(parseFloat(trade.entryPrice))}</span></div>
                            <div>Exit: <span className="font-bold">{formatPrice(parseFloat(trade.exitPrice))}</span></div>
                            <div>Stop Loss: <span className="font-bold">{formatPrice(parseFloat(trade.stopLoss || 0))}</span></div>
                            <div>Take Profit: <span className="font-bold">{formatPrice(parseFloat(trade.takeProfit || 0))}</span></div>
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-gray-700 mb-1">Performance</div>
                          <div className="grid grid-cols-2 gap-2 ml-2">
                            <div>PnL: <span className={cn("font-bold", parseFloat(trade.pnl) >= 0 ? "text-green-600" : "text-red-600")}>{formatPrice(parseFloat(trade.pnl))}</span></div>
                            <div>Return: <span className={cn("font-bold", parseFloat(trade.pnlPercent) >= 0 ? "text-green-600" : "text-red-600")}>{parseFloat(trade.pnlPercent).toFixed(2)}%</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 border border-blue-200 text-[10px]">
                      <h3 className="font-bold mb-2 uppercase">AI Reasoning & Analysis</h3>
                      {relatedAiLogs.length === 0 ? (
                        <div className="text-gray-600">No analysis logs found for this trade.</div>
                      ) : (
                        <div className="space-y-2">
                          {relatedAiLogs.map((log: any, idx: number) => (
                            <div key={idx} className="border-l-2 border-blue-400 pl-2 py-1.5">
                              <div className="font-bold text-blue-700 mb-1 uppercase">[{log.logType}]</div>
                              <pre className="whitespace-pre-wrap break-words text-[9px] text-gray-700 leading-relaxed font-mono">{removeEmojis(log.message)}</pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
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
                          {removeEmojis(formatPricesInText(log.message))}
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
                  <span className={cn(
                    equityBlinkColor === "profit" && "blink-equity-green",
                    equityBlinkColor === "loss" && "blink-equity-red"
                  )}>
                    EQUITY: {formatPrice(equity)}
                  </span>
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
