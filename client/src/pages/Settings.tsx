import { Layout } from "@/components/layout/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Strategies() {
  const [leverage, setLeverage] = useState("20");
  const [risk, setRisk] = useState("2.0");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIRecommend = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setRisk("1.25");
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">System Configuration</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">CORE PARAMETER TUNING</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 border border-border">
             <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
             <span className="text-[10px] font-mono font-medium">CONFIG SYNCED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Management */}
          <div className="bg-background border border-border p-0 shadow-sm">
            <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
               <h3 className="font-bold text-sm uppercase tracking-wider">Risk Management</h3>
               <span className="text-[10px] font-mono text-muted-foreground">MODULE_ID: RISK_CTRL_01</span>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-stop" className="font-bold">Automatic Stop Loss</Label>
                  <p className="text-xs text-muted-foreground">Dynamic SL adjustment based on volatility</p>
                </div>
                <Switch id="auto-stop" defaultChecked />
              </div>
              
              <div className="space-y-3">
                <Label className="font-bold text-xs uppercase tracking-wide">Max Leverage (x)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={leverage}
                    onChange={(e) => setLeverage(e.target.value)}
                    className="font-mono text-lg"
                    min="1"
                    max="125"
                  />
                  <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    MAX: 125x
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Hard limit for all AI executed positions.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-xs uppercase tracking-wide">Risk Per Trade (%)</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAIRecommend}
                    disabled={isAnalyzing}
                    className="h-7 text-[10px] font-mono border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        ANALYZING MARKET...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-3 h-3 mr-2" />
                        AI OPTIMIZE
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    className="font-mono text-lg"
                    step="0.1"
                    min="0.1"
                    max="10"
                  />
                  <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    CAPITAL @ RISK
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                   <span className="text-blue-500">RECOMMENDATION:</span> 
                   Current market volatility suggests <span className="font-mono font-bold text-foreground">1.25%</span> conservative risk.
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="bg-background border border-border p-0 shadow-sm">
            <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
               <h3 className="font-bold text-sm uppercase tracking-wider">Algorithm Selection</h3>
               <span className="text-[10px] font-mono text-muted-foreground">ACTIVE_NODES: 3</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between p-4 border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                <div className="space-y-1">
                  <div className="font-bold font-mono text-sm group-hover:text-primary transition-colors">STRATEGY_A: TREND_FOLLOWING</div>
                  <div className="text-xs text-muted-foreground">Momentum capture on 4H/1D timeframes using EMA crossovers.</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-start justify-between p-4 border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                <div className="space-y-1">
                  <div className="font-bold font-mono text-sm group-hover:text-primary transition-colors">STRATEGY_B: MEAN_REVERSION</div>
                  <div className="text-xs text-muted-foreground">RSI Divergence & Bollinger Band bounces on 15m timeframe.</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-start justify-between p-4 border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                <div className="space-y-1">
                  <div className="font-bold font-mono text-sm group-hover:text-primary transition-colors">STRATEGY_C: SENTIMENT_NEWS</div>
                  <div className="text-xs text-muted-foreground">NLP analysis of crypto news feeds for immediate breakout detection.</div>
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