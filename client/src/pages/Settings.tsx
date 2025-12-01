import { Layout } from "@/components/layout/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

export default function Strategies() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFullAutoOptimize = () => {
    setIsAnalyzing(true);
    // Simulate AI full system optimization
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Autonomous Core Config</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">AI SCALPING ENGINE V4.0</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 border border-border">
             <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
             <span className="text-[10px] font-mono font-medium">ENGINE: ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Master Control */}
          <div className="bg-background border border-border p-0 shadow-sm">
            <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <BrainCircuit className="w-4 h-4 text-primary" />
                 <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Autonomous Decision Engine</h3>
               </div>
               <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleFullAutoOptimize}
                  disabled={isAnalyzing}
                  className="h-7 text-[10px] font-mono bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      CALIBRATING MARKET SCANNER...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-2" />
                      FORCE MARKET RESCAN
                    </>
                  )}
                </Button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="flex items-start gap-3 p-3 bg-secondary/10 border border-border">
                    <ShieldCheck className="w-5 h-5 text-success mt-0.5" />
                    <div>
                       <h4 className="font-bold text-xs uppercase">Fully Autonomous Protection</h4>
                       <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                         The AI has full authority to determine Entry, Exit, Stop Loss, Take Profit, and Leverage based on real-time volatility.
                         It constantly monitors for fake-outs, pump/dump schemes, and liquidity traps.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-bold text-xs uppercase">Auto-Leverage Management</Label>
                        <p className="text-[10px] text-muted-foreground">AI dynamically adjusts leverage (1x-125x) based on risk score.</p>
                      </div>
                      <Switch defaultChecked disabled className="data-[state=checked]:bg-primary opacity-50" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-bold text-xs uppercase">Dynamic Pair Selection</Label>
                        <p className="text-[10px] text-muted-foreground">Scans Binance/Bybit for highest probability scalping pairs.</p>
                      </div>
                      <Switch defaultChecked disabled className="data-[state=checked]:bg-primary opacity-50" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4 border-l border-border pl-0 md:pl-8">
                 <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Active Scalping Logic</h4>
                 
                 <div className="p-3 border border-border bg-background relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <div className="font-mono font-bold text-sm mb-1">MICRO-SCALPER (1m-5m)</div>
                    <p className="text-[10px] text-muted-foreground">
                      High-frequency execution targeting 0.5% - 1.5% moves. 
                      Uses volume profile & order flow to detect institutional entries.
                      <br/><br/>
                      <span className="text-primary font-bold">PRIMARY OBJECTIVE:</span> Rapid accumulation of small wins.
                    </p>
                 </div>

                 <div className="p-3 border border-border bg-background relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-success"></div>
                    <div className="font-mono font-bold text-sm mb-1">FAKE-OUT DETECTION</div>
                    <p className="text-[10px] text-muted-foreground">
                      Analyzes order book depth and liquidation clusters to identify and avoid manipulation wicks.
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Exchange & Capital Config */}
          <div className="bg-background border border-border p-0 shadow-sm">
            <div className="p-4 border-b border-border bg-secondary/10">
               <h3 className="font-bold text-sm uppercase tracking-wider">Capital Allocation</h3>
            </div>
            <div className="p-6">
               <div className="flex items-center gap-4 max-w-md">
                  <div className="flex-1">
                    <Label className="font-bold text-xs uppercase mb-2 block">Max Portfolio Allocation (%)</Label>
                    <Input 
                      type="number" 
                      defaultValue="95"
                      className="font-mono text-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="font-bold text-xs uppercase mb-2 block">Max Open Positions</Label>
                    <Input 
                      type="number" 
                      defaultValue="5"
                      className="font-mono text-lg"
                    />
                  </div>
               </div>
               <p className="text-[10px] text-muted-foreground mt-3">
                 * The AI will distribute capital across up to 5 simultaneous scalping opportunities.
               </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}