import { BrainCircuit, Zap, RefreshCw, Wifi, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIStatus() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatusCard 
        title="AI Sentiment" 
        value="Bullish" 
        subValue="Strong Buy Signal"
        icon={BrainCircuit}
        trend="positive"
        color="blue"
      />
      
      <StatusCard 
        title="24h Profit" 
        value="+$1,240.50" 
        subValue="124 trades executed"
        icon={TrendingUp}
        trend="positive"
        color="green"
      />
      
      <StatusCard 
        title="Win Rate" 
        value="68.4%" 
        subValue="Last 100 trades"
        icon={Activity}
        trend="neutral"
        color="purple"
      />
      
      <StatusCard 
        title="Connection" 
        value="Stable" 
        subValue="12ms Latency"
        icon={Wifi}
        trend="positive"
        color="orange"
      />
    </div>
  );
}

function StatusCard({ title, value, subValue, icon: Icon, trend, color }: any) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-50",
    green: "text-green-500 bg-green-50",
    purple: "text-purple-500 bg-purple-50",
    orange: "text-orange-500 bg-orange-50",
  };

  return (
    <div className="glass-card rounded-3xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", colorMap[color])}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
        {trend === 'positive' && (
          <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>+2.4%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xs text-gray-400">{subValue}</p>
        </div>
      </div>
    </div>
  );
}