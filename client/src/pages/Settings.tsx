import { Layout } from "@/components/layout/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, ShieldCheck, Zap, Timer, Scale } from "lucide-react";
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
            <p className="text-xs font-mono text-muted-foreground mt-1">MULTI-TIMEFRAME ADAPTIVE ENGINE</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 border border-border">
             <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
             <span className="text-[10px] font-mono font-medium">AI AUTHORITY: 100%</span>
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
                      RE-CALIBRATING...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-2" />
                      FORCE RE-ANALYSIS
                    </>
                  )}
                </Button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="flex items-start gap-3 p-3 bg-secondary/10 border border-border">
                    <ShieldCheck className="w-5 h-5 text-success mt-0.5" />
                    <div>
                       <h4 className="font-bold text-xs uppercase">Total Authority Protocol</h4>
                       <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                         The AI has absolute control to execute trades ranging from sub-minute HFT scalps to multi-hour swing positions.
                         <br/><br/>
                         <span className="font-bold text-foreground">Deciding Factor:</span> Net Profit > Fees.
                         If a trade is profitable after fees in 15 seconds, the AI will exit immediately.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-bold text-xs uppercase">HFT Fee Calculation</Label>
                        <p className="text-[10px] text-muted-foreground">Real-time calculation of exchange fees vs unrealized PnL.</p>
                      </div>
                      <Switch defaultChecked disabled className="data-[state=checked]:bg-primary opacity-50" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-bold text-xs uppercase">Dynamic Timeframe Scanning</Label>
                        <p className="text-[10px] text-muted-foreground">Simultaneous analysis of 1s, 1m, 5m, and 4h charts.</p>
                      </div>
                      <Switch defaultChecked disabled className="data-[state=checked]:bg-primary opacity-50" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4 border-l border-border pl-0 md:pl-8">
                 <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Active Execution Modes</h4>
                 
                 <div className="p-3 border border-border bg-background relative overflow-hidden flex gap-3">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <Timer className="w-5 h-5 text-cyan-500 mt-1 shrink-0" />
                    <div>
                      <div className="font-mono font-bold text-sm mb-1">HFT SCALPER (SUB-MINUTE)</div>
                      <p className="text-[10px] text-muted-foreground">
                        Ultra-fast execution. Enters and exits in seconds if volatility spikes allow for profit coverage over fees.
                      </p>
                    </div>
                 </div>

                 <div className="p-3 border border-border bg-background relative overflow-hidden flex gap-3">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <Scale className="w-5 h-5 text-purple-500 mt-1 shrink-0" />
                    <div>
                      <div className="font-mono font-bold text-sm mb-1">TECHNICAL SWING</div>
                      <p className="text-[10px] text-muted-foreground">
                        Holds positions longer when chart structure (1H/4H) confirms a sustained trend.
                      </p>
                    </div>
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
                 * AI automatically balances risk across multiple assets.
               </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}