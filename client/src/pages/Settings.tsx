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

  const handleConnectExchange = async (exchange: "BINANCE" | "BYBIT") => {
    setLoading(true);
    setValidating(true);
    setError("");
    const key = exchange === "BINANCE" ? binanceKey : bybitKey;
    const secret = exchange === "BINANCE" ? binanceSecret : bybitSecret;

    if (!key || !secret) {
      setError(`Please enter both API key and secret for ${exchange}`);
      setLoading(false);
      setValidating(false);
      return;
    }

    try {
      const res = await fetch("/api/exchange/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange, apiKey: key, apiSecret: secret }),
      });
      
      if (res.ok) {
        const newConfig = await res.json();
        setConfig(newConfig);
        setError("");
        if (exchange === "BINANCE") {
          setBinanceKey("");
          setBinanceSecret("");
        } else {
          setBybitKey("");
          setBybitSecret("");
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to connect to ${exchange}`);
      }
    } catch (error) {
      console.error("Failed to connect exchange:", error);
      setError("Network error: Failed to reach the validation service");
    } finally {
      setLoading(false);
      setValidating(false);
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
                 <div className="flex items-center gap-2">
                   <BrainCircuit className="w-4 h-4 text-primary" />
                   <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Algo Config</h3>
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
                 <div className="flex items-end gap-4 max-w-md">
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
                    <Button
                      onClick={handleApplyPermissions}
                      className="h-9 px-4 font-mono text-xs font-bold bg-success/20 text-success border border-success hover:bg-success/30 hover:shadow-lg hover:scale-105 transition-all"
                      data-testid="button-apply-permissions"
                    >
                      APPLY
                    </Button>
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
            <Zap className="w-4 h-4 text-cyan-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-500">Trading Mode</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-bold text-xs uppercase">Test Mode {testMode ? '(ACTIVE)' : '(REAL)'}</Label>
                <p className="text-[10px] text-muted-foreground">
                  {testMode 
                    ? 'Simulated prices and positions. No real trades.'
                    : 'Using REAL exchange prices. Live trading active.'}
                </p>
              </div>
              <Button
                onClick={handleToggleTestMode}
                className="h-9 px-6 font-mono text-xs font-bold transition-all bg-black text-white hover:bg-white hover:text-black border border-black hover:border-black"
                data-testid="button-toggle-test-mode"
              >
                {testMode ? "Enable Live Trading" : "Switch to Test Mode"}
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

        {/* Exchange Forms - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Binance Connection */}
          <div className="space-y-3 p-4 border border-border/50 hover:border-border transition-colors" data-testid="form-binance-keys">
            <div className="flex items-center gap-2">
              {config.connectedExchange === 'BINANCE' ? (
                <Lock className="w-4 h-4 text-success" />
              ) : (
                <LockOpen className="w-4 h-4 text-muted-foreground" />
              )}
              <h4 className="font-bold text-[11px] uppercase tracking-wide">Binance</h4>
              {config.connectedExchange === 'BINANCE' && (
                <span className="text-[8px] font-mono text-success border border-success/40 px-1.5 py-0.5">CONNECTED</span>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <Label className="font-bold text-[9px] uppercase mb-1.5 block text-muted-foreground">API Key</Label>
                <Input
                  placeholder="Paste Binance API Key"
                  value={binanceKey}
                  onChange={(e) => setBinanceKey(e.target.value)}
                  disabled={!!config.connectedExchange}
                  data-testid="input-binance-key"
                  className="font-mono text-xs h-8"
                />
              </div>
              <div>
                <Label className="font-bold text-[9px] uppercase mb-1.5 block text-muted-foreground">API Secret</Label>
                <Input
                  placeholder="Paste Binance API Secret"
                  type="password"
                  value={binanceSecret}
                  onChange={(e) => setBinanceSecret(e.target.value)}
                  disabled={!!config.connectedExchange}
                  data-testid="input-binance-secret"
                  className="font-mono text-xs h-8"
                />
              </div>
            </div>
            <Button
              onClick={() => handleConnectExchange('BINANCE')}
              disabled={loading || !!config.connectedExchange || !binanceKey || !binanceSecret}
              data-testid="button-connect-binance"
              className="w-full h-8 text-[10px] font-mono font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {config.connectedExchange === 'BINANCE' ? 'CONNECTED' : 'CONNECT'}
            </Button>
          </div>

          {/* Bybit Connection */}
          <div className="space-y-3 p-4 border border-border/50 hover:border-border transition-colors" data-testid="form-bybit-keys">
            <div className="flex items-center gap-2">
              {config.connectedExchange === 'BYBIT' ? (
                <Lock className="w-4 h-4 text-success" />
              ) : (
                <LockOpen className="w-4 h-4 text-muted-foreground" />
              )}
              <h4 className="font-bold text-[11px] uppercase tracking-wide">Bybit</h4>
              {config.connectedExchange === 'BYBIT' && (
                <span className="text-[8px] font-mono text-success border border-success/40 px-1.5 py-0.5">CONNECTED</span>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <Label className="font-bold text-[9px] uppercase mb-1.5 block text-muted-foreground">API Key</Label>
                <Input
                  placeholder="Paste Bybit API Key"
                  value={bybitKey}
                  onChange={(e) => setBybitKey(e.target.value)}
                  disabled={!!config.connectedExchange}
                  data-testid="input-bybit-key"
                  className="font-mono text-xs h-8"
                />
              </div>
              <div>
                <Label className="font-bold text-[9px] uppercase mb-1.5 block text-muted-foreground">API Secret</Label>
                <Input
                  placeholder="Paste Bybit API Secret"
                  type="password"
                  value={bybitSecret}
                  onChange={(e) => setBybitSecret(e.target.value)}
                  disabled={!!config.connectedExchange}
                  data-testid="input-bybit-secret"
                  className="font-mono text-xs h-8"
                />
              </div>
            </div>
            <Button
              onClick={() => handleConnectExchange('BYBIT')}
              disabled={loading || !!config.connectedExchange || !bybitKey || !bybitSecret}
              data-testid="button-connect-bybit"
              className="w-full h-8 text-[10px] font-mono font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {config.connectedExchange === 'BYBIT' ? 'CONNECTED' : 'CONNECT'}
            </Button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-[9px] text-muted-foreground border-t border-border pt-4 italic">
          Use read-only API keys with spot trading enabled only. Never share your API secret key.
        </div>
      </div>
    </Layout>
  );
}
