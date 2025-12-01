import { Layout } from "@/components/layout/Layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, ShieldCheck, Zap, Timer, Scale, Lock, Unlock } from "lucide-react";
import { useState, useEffect } from "react";

interface Config {
  connectedExchange: string | null;
  binanceApiKey?: string;
  binanceApiSecret?: string;
  bybitApiKey?: string;
  bybitApiSecret?: string;
}

export default function Strategies() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [config, setConfig] = useState<Config>({ connectedExchange: null });
  const [binanceKey, setBinanceKey] = useState("");
  const [binanceSecret, setBinanceSecret] = useState("");
  const [bybitKey, setBybitKey] = useState("");
  const [bybitSecret, setBybitSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  const handleFullAutoOptimize = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleConnectExchange = async (exchange: "BINANCE" | "BYBIT") => {
    setLoading(true);
    const key = exchange === "BINANCE" ? binanceKey : bybitKey;
    const secret = exchange === "BINANCE" ? binanceSecret : bybitSecret;

    if (!key || !secret) {
      alert(`Please enter both API key and secret for ${exchange}`);
      setLoading(false);
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
        alert(`Connected to ${exchange}`);
      }
    } catch (error) {
      console.error("Failed to connect exchange:", error);
      alert("Failed to connect exchange");
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
      }
    } catch (error) {
      console.error("Failed to disconnect:", error);
      alert("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Exchange Config</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">EXCHANGE API KEY MANAGEMENT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Exchange Config */}
          <div className="bg-background border border-border p-0 shadow-sm">
            <div className="p-4 border-b border-border bg-secondary/10">
               <h3 className="font-bold text-sm uppercase tracking-wider">Exchange Config</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Connection Status */}
              <div className="p-4 border border-border bg-secondary/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase">Current Connection</h4>
                  <span className={`text-[10px] font-mono font-bold ${config.connectedExchange ? 'text-success' : 'text-muted-foreground'}`}>
                    {config.connectedExchange ? `${config.connectedExchange}: ACTIVE` : 'NONE: DISCONNECTED'}
                  </span>
                </div>
                {config.connectedExchange && (
                  <Button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="w-full h-8 text-[10px] font-mono bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Unlock className="w-3 h-3 mr-2" />
                    DISCONNECT {config.connectedExchange}
                  </Button>
                )}
              </div>

              {/* Binance Connection */}
              <div className="space-y-3 p-4 border border-border" data-testid="form-binance-keys">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className={`w-4 h-4 ${config.connectedExchange === 'BINANCE' ? 'text-success' : 'text-muted-foreground'}`} />
                  <h4 className="font-bold text-xs uppercase">Binance API Keys</h4>
                </div>
                <div>
                  <Label className="font-bold text-[10px] uppercase mb-1 block">API Key</Label>
                  <Input
                    placeholder="Enter Binance API Key"
                    value={binanceKey}
                    onChange={(e) => setBinanceKey(e.target.value)}
                    disabled={!!(config.connectedExchange && config.connectedExchange !== 'BINANCE')}
                    data-testid="input-binance-key"
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="font-bold text-[10px] uppercase mb-1 block">API Secret</Label>
                  <Input
                    placeholder="Enter Binance API Secret"
                    type="password"
                    value={binanceSecret}
                    onChange={(e) => setBinanceSecret(e.target.value)}
                    disabled={!!(config.connectedExchange && config.connectedExchange !== 'BINANCE')}
                    data-testid="input-binance-secret"
                    className="font-mono text-xs"
                  />
                </div>
                <Button
                  onClick={() => handleConnectExchange('BINANCE')}
                  disabled={loading || (config.connectedExchange && config.connectedExchange !== 'BINANCE') || !binanceKey || !binanceSecret}
                  data-testid="button-connect-binance"
                  className="w-full h-8 text-[10px] font-mono bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {config.connectedExchange === 'BINANCE' ? 'CONNECTED' : 'CONNECT BINANCE'}
                </Button>
              </div>

              {/* Bybit Connection */}
              <div className="space-y-3 p-4 border border-border" data-testid="form-bybit-keys">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className={`w-4 h-4 ${config.connectedExchange === 'BYBIT' ? 'text-success' : 'text-muted-foreground'}`} />
                  <h4 className="font-bold text-xs uppercase">Bybit API Keys</h4>
                </div>
                <div>
                  <Label className="font-bold text-[10px] uppercase mb-1 block">API Key</Label>
                  <Input
                    placeholder="Enter Bybit API Key"
                    value={bybitKey}
                    onChange={(e) => setBybitKey(e.target.value)}
                    disabled={!!(config.connectedExchange && config.connectedExchange !== 'BYBIT')}
                    data-testid="input-bybit-key"
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="font-bold text-[10px] uppercase mb-1 block">API Secret</Label>
                  <Input
                    placeholder="Enter Bybit API Secret"
                    type="password"
                    value={bybitSecret}
                    onChange={(e) => setBybitSecret(e.target.value)}
                    disabled={!!(config.connectedExchange && config.connectedExchange !== 'BYBIT')}
                    data-testid="input-bybit-secret"
                    className="font-mono text-xs"
                  />
                </div>
                <Button
                  onClick={() => handleConnectExchange('BYBIT')}
                  disabled={loading || (config.connectedExchange && config.connectedExchange !== 'BYBIT') || !bybitKey || !bybitSecret}
                  data-testid="button-connect-bybit"
                  className="w-full h-8 text-[10px] font-mono bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {config.connectedExchange === 'BYBIT' ? 'CONNECTED' : 'CONNECT BYBIT'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
