import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Activity, 
  BrainCircuit, 
  Wallet,
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/generated_images/minimalist_geometric_ai_trading_logo.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: History, label: "Trade History", href: "/history" },
    { icon: Activity, label: "Strategies", href: "/strategies" },
    { icon: Settings, label: "Configuration", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg tracking-tight">AutoTrade AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-4">
          <div className="bg-secondary/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <Wallet className="w-3 h-3" />
              <span>Total Balance</span>
            </div>
            <div className="text-xl font-mono font-bold text-foreground">
              $124,592.45
            </div>
            <div className="text-xs text-success mt-1 font-medium">
              +2.4% today
            </div>
          </div>
          
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2">
            <LogOut className="w-4 h-4" />
            <span>Disconnect API</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm font-medium text-muted-foreground">System Operational • Latency: 24ms</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
               <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                 AI
               </div>
               <div className="text-sm">
                 <div className="font-medium">Master Node</div>
                 <div className="text-xs text-muted-foreground">v2.4.0-stable</div>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-secondary/30">
          {children}
        </div>
      </main>
    </div>
  );
}