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
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h3 className="font-semibold text-lg text-gray-900">BTC/USDT</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1 pl-4">AI Confidence Score: <span className="text-green-600 font-bold">89%</span></p>
        </div>
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          {["15m", "1h", "4h", "1d"].map((tf) => (
            <button 
              key={tf}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                tf === "15m" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={['auto', 'auto']}
              stroke="#9CA3AF" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
                border: 'none'
              }}
              itemStyle={{ color: '#111827', fontWeight: 600, fontSize: '13px' }}
              labelStyle={{ color: '#6B7280', fontSize: '11px', marginBottom: '4px' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}