import { BrainCircuit, Zap, TrendingUp, Wifi, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIStatus() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <StatusTile 
        label="ALGORITHM STATE" 
        value="ACTIVE" 
        subValue="SCALPING_V2"
        icon={BrainCircuit}
        status="success"
      />
      
      <StatusTile 
        label="24H PROFIT" 
        value="+$1,240.50" 
        subValue="124 TRADES"
        icon={TrendingUp}
        status="success"
      />
      
      <StatusTile 
        label="WIN RATIO" 
        value="68.4%" 
        subValue="LAST 100"
        icon={BarChart3}
        status="neutral"
      />
      
      <StatusTile 
        label="API LATENCY" 
        value="12ms" 
        subValue="OPTIMIZED"
        icon={Wifi}
        status="success"
      />
    </div>
  );
}

function StatusTile({ label, value, subValue, icon: Icon, status }: any) {
  return (
    <div className="bg-background border border-border p-3 flex items-center justify-between relative overflow-hidden group">
      {status === 'success' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>}
      {status === 'neutral' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
      {status === 'warning' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning"></div>}
      
      <div className="pl-2">
        <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-0.5">{label}</div>
        <div className="text-xl font-mono font-bold text-foreground tracking-tight">{value}</div>
        <div className="text-[10px] font-mono text-muted-foreground mt-1">{subValue}</div>
      </div>
      
      <div className="opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-8 h-8" />
      </div>
    </div>
  );
}