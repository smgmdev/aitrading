import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";

const HISTORY = [
  { id: 1, pair: "BTC/USDT", side: "Long", entry: 95200, exit: 96100, pnl: "+$900.00", date: "2025-05-12 10:00" },
  { id: 2, pair: "ETH/USDT", side: "Short", entry: 3500, exit: 3480, pnl: "+$200.00", date: "2025-05-12 09:45" },
  { id: 3, pair: "XRP/USDT", side: "Long", entry: 0.60, exit: 0.58, pnl: "-$40.00", date: "2025-05-12 08:30" },
  { id: 4, pair: "SOL/USDT", side: "Long", entry: 140, exit: 145, pnl: "+$500.00", date: "2025-05-11 22:15" },
];

export default function HistoryPage() {
  return (
    <Layout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Trade History</h1>
          <p className="text-muted-foreground">Past performance and executed orders</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Pair</th>
                <th className="px-6 py-4">Side</th>
                <th className="px-6 py-4">Entry Price</th>
                <th className="px-6 py-4">Exit Price</th>
                <th className="px-6 py-4 text-right">Realized PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {HISTORY.map((trade) => (
                <tr key={trade.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">{trade.date}</td>
                  <td className="px-6 py-4 font-bold">{trade.pair}</td>
                  <td className="px-6 py-4">
                    <Badge variant={trade.side === "Long" ? "default" : "destructive"}>{trade.side}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono">${trade.entry.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">${trade.exit.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${trade.pnl.startsWith("+") ? "text-success" : "text-destructive"}`}>
                    {trade.pnl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}