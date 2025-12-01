import { Layout } from "@/components/layout/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export default function Strategies() {
  return (
    <Layout>
      <div className="space-y-6 max-w-[1000px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Strategy Configuration</h1>
          <p className="text-muted-foreground">Fine-tune the AI's decision making parameters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Management */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-lg">Risk Management</h3>
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-stop">Automatic Stop Loss</Label>
                <Switch id="auto-stop" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>Max Leverage (20x)</Label>
                <Slider defaultValue={[20]} max={100} step={1} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label>Risk per Trade (2%)</Label>
                <Slider defaultValue={[2]} max={10} step={0.5} className="w-full" />
              </div>
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-lg">Active Strategies</h3>
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/20">
                <div>
                  <div className="font-medium">Trend Following</div>
                  <div className="text-xs text-muted-foreground">Long term momentum capture</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/20">
                <div>
                  <div className="font-medium">Mean Reversion</div>
                  <div className="text-xs text-muted-foreground">Short term bounce plays</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/20">
                <div>
                  <div className="font-medium">Sentiment Analysis</div>
                  <div className="text-xs text-muted-foreground">News-based trading</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}