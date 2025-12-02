import { Layout } from "@/components/layout/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, ShieldCheck, Zap, Timer, Scale, Lock, Unlock, LockOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface Config {
  connectedExchange: string | null;
  binanceApiKey?: string;
  binanceApiSecret?: string;
  bybitApiKey?: string;
  bybitApiSecret?: string;
  testMode?: boolean;
}

export default function Strategies() {
  const [location] = useLocation();
  const isAlgoConfig = location === "/strategies";
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [config, setConfig] = useState<Config>({ connectedExchange: null });
  const [binanceKey, setBinanceKey] = useState("");
  const [binanceSecret, setBinanceSecret] = useState("");
  const [bybitKey, setBybitKey] = useState("");
  const [bybitSecret, setBybitSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [validating, setValidating] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [maxAllocation, setMaxAllocation] = useState("95");
  const [maxPositions, setMaxPositions] = useState("5");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
      setTestMode(data.testMode ?? true);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  const handleToggleTestMode = async () => {
    try {
      const res = await fetch("/api/test-mode/toggle", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTestMode(data.testMode);
        setConfig({ ...config, testMode: data.testMode });
      }
    } catch (error) {
      console.error("Failed to toggle test mode:", error);
    }
  };

  const handleApplyPermissions = () => {
    // Apply permission settings (would save to backend in full implementation)
    alert(`Applied: Max Allocation ${maxAllocation}%, Max Positions ${maxPositions}`);
  };

  const handleFullAutoOptimize = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleActivateExchange = async (exchange: "BINANCE" | "BYBIT") => {
    setLoading(true);
    setError("");
    
    try {
      console.log(`[UI] Activating ${exchange}...`);
      const res = await fetch("/api/exchange/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange }),
      });
      
      if (res.ok) {
        const newConfig = await res.json();
        console.log(`[UI] Activated:`, newConfig);
        setConfig(newConfig);
        setError("");
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to activate ${exchange}`);
      }
    } catch (error: any) {
      console.error("[UI] Failed to activate exchange:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exchange/disconnect", { method: "POST" });
      if (res.ok) {
        const newConfig = await res.json();
        setConfig(newConfig);
        alert("Disconnected from exchange");
        // Force page reload to ensure all state is refreshed from backend
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to disconnect:", error);
      alert("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  if (isAlgoConfig) {
    return (
      <Layout>
        <div className="space-y-6 max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Algo Config</h1>
              <p className="text-xs font-mono text-muted-foreground mt-1">ALGORITHM STRATEGIES & SETTINGS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Algo Config */}
            <div className="bg-background border border-border p-0 shadow-sm">
              <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
                 <h3 className="font-bold text-sm uppercase tracking-wider text-primary">AI Trading Config</h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="flex items-start gap-3 p-3 bg-secondary/10 border border-border">
                      <ShieldCheck className="w-7 h-7 text-success mt-0.5" />
                      <div>
                         <h4 className="font-bold text-xs uppercase">Total Authority Protocol</h4>
                         <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                           The AI has absolute control to execute trades ranging from sub-minute HFT scalps to multi-hour swing positions.
                           <br/><br/>
                           <span className="font-bold text-foreground">Deciding Factor:</span> Net Profit &gt; Fees.
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

                <div className="space-y-4 pl-0 md:pl-0">
                   <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Active Execution Modes</h4>
                   
                   <div className="p-3 border border-border bg-background relative overflow-hidden flex gap-3">
                      <Timer className="w-5 h-5 text-cyan-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-mono font-bold text-sm mb-1">HFT SCALPER (SUB-MINUTE)</div>
                        <p className="text-[10px] text-muted-foreground">
                          Ultra-fast execution. Enters and exits in seconds if volatility spikes allow for profit coverage over fees.
                        </p>
                      </div>
                   </div>

                   <div className="p-3 border border-border bg-background relative overflow-hidden flex gap-3">
                      <Scale className="w-5 h-5 text-purple-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-mono font-bold text-sm mb-1">TECHNICAL SWING (1-12m)</div>
                        <p className="text-[10px] text-muted-foreground">
                          Holds positions slightly longer (up to 12 mins) when trend structure confirms strong momentum.
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Permission Settings Config */}
            <div className="bg-background border border-border p-0 shadow-sm">
              <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                 <h3 className="font-bold text-sm uppercase tracking-wider">Permission Settings</h3>
              </div>
              <div className="p-6">
                 <div className="flex gap-4 max-w-md">
                    <div className="flex-1">
                      <Label className="font-bold text-xs uppercase mb-2 block">Max Portfolio Allocation (%)</Label>
                      <Input 
                        type="number" 
                        value={maxAllocation}
                        onChange={(e) => setMaxAllocation(e.target.value)}
                        className="font-mono text-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="font-bold text-xs uppercase mb-2 block">Max Open Positions</Label>
                      <Input 
                        type="number" 
                        value={maxPositions}
                        onChange={(e) => setMaxPositions(e.target.value)}
                        className="font-mono text-lg"
                      />
                    </div>
                 </div>
                 <Button
                   onClick={handleApplyPermissions}
                   className="w-40 h-9 font-mono text-xs font-bold transition-all bg-black text-white hover:bg-white hover:text-black border border-black hover:border-black mt-4 uppercase"
                   data-testid="button-apply-permissions"
                 >
                   APPLY
                 </Button>
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

  return (
    <Layout>
      <div className="space-y-6 max-w-[900px] mx-auto">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Settings</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">EXCHANGE CONFIG & TRADING MODE</p>
        </div>

        {/* Test Mode Toggle */}
        <div className="bg-background border border-border p-0 shadow-sm">
          <div className="p-4 border-b border-border bg-cyan-500/5 flex items-center gap-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-500">Data Mode</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="font-bold text-xs uppercase">Exchange Price {testMode ? '(Simulated)' : '(Real Data)'}</Label>
                <p className="text-[10px] text-muted-foreground">
                  {config.connectedExchange 
                    ? (testMode 
                        ? 'Simulated prices and positions. No real trades.'
                        : 'Using REAL exchange prices. No real trades.')
                    : 'Connect an exchange first to enable real price mode.'}
                </p>
              </div>
              <Button
                onClick={handleToggleTestMode}
                disabled={!config.connectedExchange || loading}
                className={`group w-48 h-9 font-mono text-xs font-bold transition-all uppercase ${
                  !config.connectedExchange || loading
                    ? 'bg-muted text-muted-foreground border border-muted cursor-not-allowed opacity-50'
                    : 'bg-black text-white hover:bg-white hover:text-black border border-black hover:border-black'
                }`}
                data-testid="button-toggle-test-mode"
              >
                <span className="group-hover:hidden">
                  {config.connectedExchange 
                    ? (testMode ? "REAL PRICES ARE OFF" : "REAL PRICES ARE ON")
                    : "CONNECT EXCHANGE FIRST"}
                </span>
                <span className="hidden group-hover:inline">
                  {config.connectedExchange 
                    ? (testMode ? "TURN REAL PRICES ON" : "TURN REAL PRICES OFF")
                    : "CONNECT EXCHANGE FIRST"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Status Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono uppercase font-bold text-muted-foreground">Status</div>
            <span className={`text-[10px] font-mono font-bold px-2 py-1 border flex items-center gap-2 ${config.connectedExchange ? 'text-success border-success/40' : 'text-muted-foreground border-border'}`}>
              {config.connectedExchange ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
              {config.connectedExchange ? `${config.connectedExchange}: ACTIVE` : 'DISCONNECTED'}
            </span>
          </div>
          {config.connectedExchange && (
            <Button
              onClick={handleDisconnect}
              disabled={loading}
              size="sm"
              className="h-6 text-[9px] font-mono text-destructive hover:text-destructive-foreground hover:bg-destructive/20 border border-destructive/40"
              variant="outline"
            >
              <Unlock className="w-3 h-3 mr-1" />
              DISCONNECT
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 border border-destructive/40 text-destructive text-[10px] font-mono">
            {error}
          </div>
        )}

        {/* Validating Status */}
        {validating && (
          <div className="px-4 py-2 border border-primary/40 text-primary text-[10px] font-mono">
            Validating API credentials with exchange...
          </div>
        )}

        {/* Exchange Activation Buttons */}
        <div className="bg-background border border-border p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm uppercase">Exchange Selection</h3>
            <p className="text-[10px] text-muted-foreground">API keys must be added to database first. Click to activate.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleActivateExchange('BINANCE')}
              disabled={loading || config.connectedExchange === 'BINANCE'}
              data-testid="button-activate-binance"
              className={`h-12 text-xs font-mono font-bold transition-all uppercase ${
                config.connectedExchange === 'BINANCE'
                  ? 'bg-green-500/20 text-green-600 border border-green-500/40 cursor-default'
                  : 'bg-black text-white hover:bg-white hover:text-black border border-black hover:border-black'
              }`}
            >
              {config.connectedExchange === 'BINANCE' ? '✓ BINANCE ACTIVE' : 'ACTIVATE BINANCE'}
            </Button>
            <Button
              onClick={() => handleActivateExchange('BYBIT')}
              disabled={loading || config.connectedExchange === 'BYBIT'}
              data-testid="button-activate-bybit"
              className={`h-12 text-xs font-mono font-bold transition-all uppercase ${
                config.connectedExchange === 'BYBIT'
                  ? 'bg-green-500/20 text-green-600 border border-green-500/40 cursor-default'
                  : 'bg-black text-white hover:bg-white hover:text-black border border-black hover:border-black'
              }`}
            >
              {config.connectedExchange === 'BYBIT' ? '✓ BYBIT ACTIVE' : 'ACTIVATE BYBIT'}
            </Button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-[9px] text-muted-foreground border-t border-border pt-4 italic">
          To add/change API keys: Update system_config table in database directly. Use read-only keys only.
        </div>
      </div>
    </Layout>
  );
}
