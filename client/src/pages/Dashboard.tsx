import { Layout } from "@/components/layout/Layout";
import { ActiveTrades } from "@/components/dashboard/ActiveTrades";
import { ChartsWithTabs } from "@/components/dashboard/ChartsWithTabs";
import { TradeLogs } from "@/components/dashboard/TradeLogs";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col h-full min-h-[calc(100vh-11rem)] gap-4 pb-4 px-4">
        {/* Chart Section - Full Width, Dominant Height */}
        <div className="flex-[2] min-h-[400px]">
           <ChartsWithTabs />
        </div>

        {/* Active Trades Section */}
        <div className="flex-1 min-h-[250px]">
           <ActiveTrades />
        </div>

        {/* Trade Logs Console */}
        <div className="flex-1 min-h-[200px]">
           <TradeLogs />
        </div>
      </div>
    </Layout>
  );
}
