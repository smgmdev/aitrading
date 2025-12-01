import { Layout } from "@/components/layout/Layout";
import { AIStatus } from "@/components/dashboard/AIStatus";
import { ActiveTrades } from "@/components/dashboard/ActiveTrades";
import { MarketChart } from "@/components/dashboard/MarketChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Command Center</h1>
            <p className="text-muted-foreground">Autonomous trading overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
              AI Mode: Aggressive
            </div>
            <div className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium border border-success/20">
              Risk Level: Medium
            </div>
          </div>
        </div>

        <AIStatus />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          <div className="lg:col-span-2 h-full">
            <MarketChart />
          </div>
          <div className="h-full">
            <ActivityFeed />
          </div>
        </div>

        <div className="h-[400px]">
          <ActiveTrades />
        </div>
      </div>
    </Layout>
  );
}