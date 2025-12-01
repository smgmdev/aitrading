import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { useState, useEffect } from "react";
import { cn, formatPrice, formatNumber } from "@/lib/utils";
import { BrainCircuit, ShieldAlert, Timer } from "lucide-react";

// Simulated market data for scalping (faster movements)
const generateData = () => {
  const data = [];
  let price = 96500;
  for (let i = 0; i < 60; i++) {
    price = price + (Math.random() - 0.5) * 50; // Higher volatility for scalping demo
    data.push({
      time: i,
      value: price,
      formattedTime: `10:${i < 10 ? '0' + i : i}`
    });
  }
  return data;
};

const data = generateData();

const TIMEFRAMES = ["1s", "1m", "5m", "15m", "30m", "1h", "4h"];

export function MarketChart() {
  const [activeTimeframe, setActiveTimeframe] = useState("1m"); // Default to 1m for scalping
  
  // Simulated AI Decisions
  const currentPrice = data[data.length - 1].value;
  const entryPrice = 96480;
  const tpPrice = 96650; // Tight TP for scalp
  const slPrice = 96400; // Tight SL for scalp
  
  return (
    <div className="bg-background border border-border h-full flex flex-col relative">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 py-2 border-b border-border bg-secondary/10 gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="font-bold text-lg text-foreground">BTC/USDT</h3>
              <span className="text-xs font-mono text-muted-foreground">PERP</span>
            </div>
          </div>
          <div className="hidden lg:block h-6 w-px bg-border"></div>
          <div className="flex flex-col items-end lg:items-start">
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Current</span>
            <span className="text-sm font-mono font-bold text-foreground">{formatPrice(currentPrice)}</span>
          </div>
          <div className="flex flex-col items-end lg:items-start">
             <div className="flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-primary uppercase font-bold">MODE: ADAPTIVE</span>
             </div>
             <span className="text-[10px] text-muted-foreground font-mono">HFT + SWING HYBRID</span>
          </div>
        </div>
        
        <div className="w-full lg:w-auto overflow-x-auto">
          <div className="flex border border-border bg-background min-w-max">
            {TIMEFRAMES.map((tf) => (
              <button 
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={cn(
                  "text-[10px] font-bold px-3 py-1.5 transition-colors border-r border-border last:border-r-0 min-w-[40px] flex-1 lg:flex-none",
                  activeTimeframe === tf 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full relative group">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
             <div className="px-2 py-1 bg-background/90 border border-border backdrop-blur text-[10px] font-mono shadow-sm flex items-center gap-2">
                <Timer className="w-3 h-3 text-cyan-500" />
                <span className="text-muted-foreground">AI STRATEGY:</span> <span className="text-foreground font-bold">MULTI-TIMEFRAME SCAN</span>
             </div>
             <div className="px-2 py-1 bg-background/90 border border-border backdrop-blur text-[10px] font-mono shadow-sm flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-success" />
                <span className="text-success font-bold">PROFIT &gt; FEE CHECK: PASS</span>
             </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="formattedTime" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10} 
              tickLine={true}
              axisLine={true}
              fontFamily="monospace"
              dy={5}
            />
            <YAxis 
              domain={['auto', 'auto']}
              orientation="right"
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10} 
              tickLine={true}
              axisLine={true}
              tickFormatter={(value) => value.toFixed(1)}
              fontFamily="monospace"
              width={60}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '0px',
                boxShadow: 'none',
                padding: '4px 8px',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'monospace', fontSize: '11px' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '2px', fontFamily: 'monospace' }}
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            <ReferenceLine y={entryPrice} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'right', value: 'ENTRY', fill: 'hsl(var(--primary))', fontSize: 10, fontFamily: 'monospace' }} />
            <ReferenceLine y={tpPrice} stroke="hsl(var(--success))" label={{ position: 'right', value: 'TP', fill: 'hsl(var(--success))', fontSize: 10, fontFamily: 'monospace' }} />
            <ReferenceLine y={slPrice} stroke="hsl(var(--destructive))" label={{ position: 'right', value: 'SL', fill: 'hsl(var(--destructive))', fontSize: 10, fontFamily: 'monospace' }} />
            
            <Area 
              type="step" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}