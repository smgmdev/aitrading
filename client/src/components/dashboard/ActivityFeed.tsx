import { Terminal, Search, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGS = [
  { id: 1, time: "11:02", type: "scan", message: "Scanning 45 pairs for volatility" },
  { id: 2, time: "11:03", type: "signal", message: "BTC/USDT RSI Divergence detected" },
  { id: 3, time: "11:03", type: "action", message: "Entering LONG position @ 97,200" },
  { id: 4, time: "11:03", type: "success", message: "Order filled successfully" },
  { id: 5, time: "11:05", type: "info", message: "Adjusting dynamic Stop Loss" },
  { id: 6, time: "11:06", type: "scan", message: "Analyzing market sentiment" },
];

export function ActivityFeed() {
  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-gray-900">Live Activity</h3>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-6 thin-scroll pr-2">
        {LOGS.map((log, index) => (
          <div key={log.id} className="relative pl-6 pb-0 group">
             {/* Timeline Line */}
             {index !== LOGS.length - 1 && (
               <div className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-gray-100 group-hover:bg-gray-200 transition-colors"></div>
             )}
             
             {/* Timeline Dot */}
             <div className={cn(
               "absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center",
               log.type === 'scan' && "bg-blue-100",
               log.type === 'signal' && "bg-orange-100",
               log.type === 'action' && "bg-purple-100",
               log.type === 'success' && "bg-green-100",
               log.type === 'info' && "bg-gray-100",
             )}>
               <div className={cn(
                 "w-1.5 h-1.5 rounded-full",
                 log.type === 'scan' && "bg-blue-500",
                 log.type === 'signal' && "bg-orange-500",
                 log.type === 'action' && "bg-purple-500",
                 log.type === 'success' && "bg-green-500",
                 log.type === 'info' && "bg-gray-500",
               )}></div>
             </div>

            <div className="flex flex-col">
               <span className="text-[10px] font-medium text-gray-400 mb-0.5 font-mono">{log.time}</span>
               <span className="text-sm font-medium text-gray-700">{log.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}