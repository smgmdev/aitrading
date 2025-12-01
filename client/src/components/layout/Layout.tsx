import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Activity, 
  Wallet,
  LogOut,
  Bell,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/generated_images/minimalist_geometric_ai_trading_logo.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: History, label: "History", href: "/history" },
    { icon: Activity, label: "Strategies", href: "/strategies" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F2F2F7] text-foreground overflow-hidden font-sans selection:bg-blue-100">
      {/* Floating Sidebar - iOS style */}
      <aside className="w-20 lg:w-64 m-4 mr-0 rounded-3xl glass border-none flex flex-col shadow-sm z-20 transition-all duration-300">
        <div className="p-6 flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <img src={logo} alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
          </div>
          <div className="hidden lg:block">
             <span className="font-semibold text-lg tracking-tight block leading-none">AutoTrade</span>
             <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Pro</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer group relative overflow-hidden",
                  isActive 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
                )}>
                  <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600")} strokeWidth={2} />
                  <span className="hidden lg:block">{item.label}</span>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full lg:hidden"></div>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-4 hidden lg:block">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                 <Wallet className="w-4 h-4" />
               </div>
               <span className="text-xs font-medium text-white/60">Total Equity</span>
            </div>
            <div className="text-xl font-semibold tracking-tight">
              $124,592
            </div>
            <div className="text-xs text-green-400 mt-1 font-medium flex items-center gap-1">
              +2.4% <span className="text-white/40">today</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full px-2 py-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2">
             <h2 className="text-2xl font-semibold text-gray-900">
               {navItems.find(i => i.href === location)?.label || 'Dashboard'}
             </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium text-gray-600 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              System Active
            </div>
            
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors relative shadow-sm hover:shadow-md">
              <Bell className="w-5 h-5" strokeWidth={2} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pt-2 thin-scroll">
          {children}
        </div>
      </main>
    </div>
  );
}