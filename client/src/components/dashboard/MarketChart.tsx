import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { time: "10:00", value: 96200 },
  { time: "10:05", value: 96350 },
  { time: "10:10", value: 96300 },
  { time: "10:15", value: 96450 },
  { time: "10:20", value: 96600 },
  { time: "10:25", value: 96550 },
  { time: "10:30", value: 96700 },
  { time: "10:35", value: 96850 },
  { time: "10:40", value: 96800 },
  { time: "10:45", value: 96950 },
  { time: "10:50", value: 97100 },
  { time: "10:55", value: 97050 },
  { time: "11:00", value: 97200 },
  { time: "11:05", value: 97150 },
  { time: "11:10", value: 97300 },
];

export function MarketChart() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">BTC/USDT Analysis</h3>
          <p className="text-xs text-muted-foreground">AI Confidence: 89% (Long Trend)</p>
        </div>
        <div className="flex gap-2">
          {["15m", "1h", "4h", "1d"].map((tf) => (
            <button 
              key={tf}
              className={`text-xs font-medium px-2 py-1 rounded ${tf === "15m" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']}
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'monospace' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}