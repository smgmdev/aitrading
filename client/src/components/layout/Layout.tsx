import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Activity, 
  Wallet,
  LogOut,
  Bell,
  Menu,
  Cpu,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "TERMINAL", href: "/" },
    { icon: History, label: "EXECUTION LOGS", href: "/history" },
    { icon: Activity, label: "ALGORITHMS", href: "/strategies" },
    { icon: Settings, label: "SYSTEM CONFIG", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans text-sm">
      {/* Professional Sidebar - Solid, Square, Data-heavy */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-2 bg-secondary/30 border-b border-border">
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground mb-1">
            <span>SERVER TIME</span>
            <span>14:22:59 UTC</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
            <span>LATENCY</span>
            <span className="text-success">12ms</span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <div className="px-4 text-[10px] font-bold text-muted-foreground mb-2 tracking-widest">MODULES</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors cursor-pointer border-l-2",
                  isActive 
                    ? "bg-secondary border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border">
          <button className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full py-3">
            <LogOut className="w-3 h-3" />
            <span>DISCONNECT SESSION</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-4">
             <h2 className="font-bold text-sm tracking-wide uppercase">
               {navItems.find(i => i.href === location)?.label || 'TERMINAL'}
             </h2>
             <div className="h-4 w-px bg-border"></div>
             <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Network className="w-3 h-3" />
                <span>BINANCE: CONNECTED</span>
                <span className="text-border">|</span>
                <span>BYBIT: CONNECTED</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-secondary border border-border text-xs font-mono">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                SYSTEM: ONLINE
             </div>
             <button className="p-2 hover:bg-secondary border border-transparent hover:border-border transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-secondary/10 p-4">
          {children}
        </div>
      </main>
    </div>
  );
}