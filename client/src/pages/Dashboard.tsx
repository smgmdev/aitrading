import { Layout } from "@/components/layout/Layout";
import { AIStatus } from "@/components/dashboard/AIStatus";
import { ActiveTrades } from "@/components/dashboard/ActiveTrades";
import { MarketChart } from "@/components/dashboard/MarketChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
        {/* Top Stats Row */}
        <div className="shrink-0">
           <AIStatus />
        </div>

        {/* Main Grid - Split Chart and Feed */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          <div className="lg:col-span-3 h-full">
            <MarketChart />
          </div>
          <div className="h-full">
            <ActivityFeed />
          </div>
        </div>

        {/* Bottom Section - Trades */}
        <div className="h-[250px] shrink-0">
          <ActiveTrades />
        </div>
      </div>
    </Layout>
  );
}