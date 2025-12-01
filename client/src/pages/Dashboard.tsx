import { Layout } from "@/components/layout/Layout";
import { AIStatus } from "@/components/dashboard/AIStatus";
import { ActiveTrades } from "@/components/dashboard/ActiveTrades";
import { MarketChart } from "@/components/dashboard/MarketChart";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col h-full min-h-[calc(100vh-11rem)] gap-4 pb-4">
        {/* Top Stats Row */}
        <div className="shrink-0">
           <AIStatus />
        </div>

        {/* Chart Section - Full Width, Dominant Height */}
        <div className="flex-[2] min-h-[400px]">
           <MarketChart />
        </div>

        {/* Active Trades Section */}
        <div className="flex-1 min-h-[250px]">
           <ActiveTrades />
        </div>
      </div>
    </Layout>
  );
}
