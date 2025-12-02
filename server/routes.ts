import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPositionSchema, insertAiLogSchema, insertSystemConfigSchema } from "@shared/schema";
import { validateBinanceKeys, validateBybitKeys } from "./validation";

// Wrapper to handle async errors in routes
const asyncHandler = (fn: (req: any, res: any, next?: any) => Promise<any>) => 
  (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Positions endpoints
  app.get("/api/positions", asyncHandler(async (req, res) => {
    const positions = await storage.getAllPositions();
    res.json(positions);
  }));

  app.get("/api/positions/open", async (req, res) => {
    const positions = await storage.getOpenPositions();
    res.json(positions);
  });

  app.get("/api/positions/closed", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const positions = await storage.getClosedPositions(limit);
    res.json(positions);
  });

  app.get("/api/positions/manually-closed", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const positions = await storage.getManuallyClosedPositions(limit);
    res.json(positions);
  });

  app.get("/api/positions/:id", async (req, res) => {
    const position = await storage.getPositionById(parseInt(req.params.id));
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json(position);
  });

  app.post("/api/positions", async (req, res) => {
    const validation = insertPositionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid position data" });
    }
    const position = await storage.createPosition(validation.data);
    res.json(position);
  });

  app.patch("/api/positions/:id", async (req, res) => {
    const position = await storage.updatePosition(parseInt(req.params.id), req.body);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json(position);
  });

  app.post("/api/positions/:id/close", async (req, res) => {
    const { exitPrice } = req.body;
    if (!exitPrice) {
      return res.status(400).json({ message: "exitPrice is required" });
    }
    const positionId = parseInt(req.params.id);
    const position = await storage.getPositionById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    
    const exitTime = new Date();
    const closedPosition = await storage.closePositionByUser(positionId, exitPrice, exitTime);
    
    // Create log entry for manual close
    if (closedPosition) {
      const pnl = parseFloat(closedPosition.pnl || "0");
      const pnlPercent = (closedPosition.pnlPercent || "0").toString();
      await storage.createLog({
        logType: "EXIT",
        message: `Manually closed ${position.side} position on ${position.pair} at ${exitPrice}. PnL: ${pnl.toFixed(2)} (${pnlPercent}%)`,
        pair: position.pair,
        relatedTradeId: position.tradeId,
      });
    }
    
    res.json(closedPosition);
  });

  // AI Logs endpoints
  app.get("/api/logs", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const logs = await storage.getRecentLogs(limit);
    res.json(logs);
  });

  app.post("/api/logs", async (req, res) => {
    const validation = insertAiLogSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid log data" });
    }
    const log = await storage.createLog(validation.data);
    res.json(log);
  });

  // System Config endpoints
  app.get("/api/config", async (req, res) => {
    const config = await storage.getSystemConfig();
    res.json(config);
  });

  app.patch("/api/config", async (req, res) => {
    const validation = insertSystemConfigSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid config data" });
    }
    const config = await storage.updateSystemConfig(validation.data);
    res.json(config);
  });

  // Exchange connection endpoints
  app.get("/api/exchange/connected", async (req, res) => {
    const exchange = await storage.getConnectedExchange();
    res.json({ connected: exchange || null });
  });

  app.post("/api/exchange/connect", async (req, res) => {
    try {
      const { exchange, apiKey, apiSecret } = req.body;
      console.log(`[CONNECT] Starting connection for ${exchange}`);
      
      if (!exchange || !apiKey || !apiSecret) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).send(JSON.stringify({ message: "exchange, apiKey, and apiSecret are required" }));
      }
      if (!["BINANCE", "BYBIT"].includes(exchange)) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).send(JSON.stringify({ message: "exchange must be BINANCE or BYBIT" }));
      }

      // Store credentials without validation - validation will happen when used for trading
      console.log(`[CONNECT] Storing ${exchange} credentials...`);
      const config = await storage.connectExchange(exchange, apiKey, apiSecret);
      
      if (!config) {
        console.error("[CONNECT] Database returned undefined config");
        res.setHeader("Content-Type", "application/json");
        return res.status(500).send(JSON.stringify({ 
          message: "Failed to save credentials to database" 
        }));
      }
      
      console.log(`[CONNECT] Successfully stored ${exchange} credentials`);
      
      const responseObj = {
        id: config.id,
        connectedExchange: config.connectedExchange,
        testMode: config.testMode,
        binanceApiKey: config.binanceApiKey ? "***" : undefined,
        binanceApiSecret: config.binanceApiSecret ? "***" : undefined,
        bybitApiKey: config.bybitApiKey ? "***" : undefined,
        bybitApiSecret: config.bybitApiSecret ? "***" : undefined,
      };
      
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify(responseObj));
    } catch (error: any) {
      console.error("[CONNECT] Error:", error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).send(JSON.stringify({ 
        message: `Error: ${error.message || "Failed to connect to exchange"}` 
      }));
    }
  });

  app.post("/api/exchange/disconnect", async (req, res) => {
    const config = await storage.disconnectExchange();
    res.json(config);
  });

  // Force clear endpoint for debugging stale connection states
  app.post("/api/exchange/force-clear", async (req, res) => {
    try {
      const config = await storage.disconnectExchange();
      res.json({ success: true, config });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to force clear" });
    }
  });

  // Trading pairs endpoint
  app.get("/api/trading-pairs", async (req, res) => {
    const defaultPairs = [
      "BTCUSDT",
      "ETHUSDT",
      "SOLAUSDT",
      "ADAUSDT",
      "DOGEUSDT",
      "XRPUSDT",
      "AVAXUSDT",
      "BNBUSDT",
      "LINKUSDT",
      "MATICUSDT",
    ];
    res.json({ pairs: defaultPairs });
  });

  // Test Mode endpoints
  app.get("/api/test-mode", async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      res.json({ testMode: config?.testMode ?? true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/test-mode/toggle", async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      const newTestMode = !(config?.testMode ?? true);
      const updated = await storage.updateSystemConfig({ testMode: newTestMode });
      res.json({ testMode: updated.testMode });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Global error handler - MUST be last
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[ERROR] Unhandled error:", {
      message: err?.message || "Unknown error",
      stack: err?.stack,
      name: err?.name,
    });
    
    // Always return JSON for API errors
    if (req.path.startsWith("/api/")) {
      return res.status(500).json({
        message: err?.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      });
    }
    
    // For non-API routes, pass to next handler
    next(err);
  });

  return httpServer;
}
