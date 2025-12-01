import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Activity, 
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

type ConnectionStatus = "live" | "testnet" | "disconnected";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [connectedExchange, setConnectedExchange] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const fetchExchange = async () => {
      const startTime = Date.now();
      try {
        const res = await fetch("/api/exchange/connected");
        const endTime = Date.now();
        setLatency(endTime - startTime);
        
        const data = await res.json();
        setConnectedExchange(data.connected);
        
        // Determine connection status (for now, if connected assume LIVE)
        if (data.connected) {
          setConnectionStatus("live");
        } else {
          setConnectionStatus("disconnected");
        }
      } catch (error) {
        console.error("Failed to fetch connected exchange:", error);
        setConnectionStatus("disconnected");
      }
    };

    fetchExchange();
    const interval = setInterval(fetchExchange, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "TERMINAL", href: "/" },
    { icon: History, label: "EXECUTION LOGS", href: "/history" },
    { icon: Activity, label: "ALGO CONFIG", href: "/strategies" },
    { icon: Settings, label: "SYSTEM CONFIG", href: "/settings" },
  ];

  const statusColor = connectionStatus === "live" ? "bg-success" : connectionStatus === "testnet" ? "bg-warning" : "bg-destructive";
  const statusLabel = connectionStatus === "live" ? "LIVE" : connectionStatus === "testnet" ? "TESTNET" : "NOT CONNECTED";

  const exchangeLabel = connectedExchange === "BINANCE" ? "Binance connected" : connectedExchange === "BYBIT" ? "Bybit connected" : "Exchange not connected";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans text-sm flex-col">
      {/* Header */}
      <header className="h-8 border-b border-border flex items-center justify-between px-4 bg-black">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase">
              <span className={cn("w-2 h-2 rounded-full", statusColor)}></span>
              <span>{statusLabel}</span>
           </div>
           <div className="h-3 w-px bg-border"></div>
           <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase">
              <span>{exchangeLabel}</span>
           </div>
           <div className="h-3 w-px bg-border"></div>
           <div className="flex items-center gap-1 text-[10px] font-mono text-white uppercase">
              <span>LATENCY: {latency}MS</span>
           </div>
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
  );
}
