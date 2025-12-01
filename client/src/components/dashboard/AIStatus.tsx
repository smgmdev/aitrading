import { BrainCircuit, Zap, RefreshCw, Wifi } from "lucide-react";

export function AIStatus() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between relative overflow-hidden group">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 -skew-x-12 group-hover:bg-primary/10 transition-colors"></div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Sentiment</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">Bullish</h3>
          <p className="text-xs text-success font-medium mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Strong Buy Signal
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <BrainCircuit className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">24h Profit</p>
          <h3 className="text-2xl font-mono font-bold text-success mt-1">+$1,240.50</h3>
          <p className="text-xs text-muted-foreground mt-1">124 trades executed</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
          <RefreshCw className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Win Rate</p>
          <h3 className="text-2xl font-mono font-bold text-foreground mt-1">68.4%</h3>
          <p className="text-xs text-muted-foreground mt-1">Last 100 trades</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
          <ActivityIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Status</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">Connected</h3>
          <p className="text-xs text-success font-medium mt-1">Binance • Bybit</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success animate-pulse">
          <Wifi className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}