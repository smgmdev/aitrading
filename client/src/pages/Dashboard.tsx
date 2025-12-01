import { Layout } from "@/components/layout/Layout";
import { AIStatus } from "@/components/dashboard/AIStatus";
import { ActiveTrades } from "@/components/dashboard/ActiveTrades";
import { MarketChart } from "@/components/dashboard/MarketChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-6">
        <AIStatus />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[420px]">
          <div className="lg:col-span-2 h-full">
            <MarketChart />
          </div>
          <div className="h-full">
            <ActivityFeed />
          </div>
        </div>

        <div className="h-auto lg:h-[350px]">
          <ActiveTrades />
        </div>
      </div>
    </Layout>
  );
}