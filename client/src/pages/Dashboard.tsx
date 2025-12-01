import { Layout } from "@/components/layout/Layout";
import { AIStatus } from "@/components/dashboard/AIStatus";
import { ActiveTrades } from "@/components/dashboard/ActiveTrades";
import { MarketChart } from "@/components/dashboard/MarketChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col h-full min-h-[calc(100vh-6rem)] gap-4 pb-4">
        {/* Top Stats Row */}
        <div className="shrink-0">
           <AIStatus />
        </div>

        {/* Chart Section - Full Width, Dominant Height */}
        <div className="flex-[2] min-h-[400px]">
           <MarketChart />
        </div>

        {/* Bottom Section - Split Logs and Trades */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[250px]">
           <div className="lg:col-span-2 h-full">
              <ActivityFeed />
           </div>
           <div className="lg:col-span-3 h-full">
              <ActiveTrades />
           </div>
        </div>
      </div>
    </Layout>
  );
}