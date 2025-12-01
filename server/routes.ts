import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPositionSchema, insertAiLogSchema, insertSystemConfigSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Positions endpoints
  app.get("/api/positions", async (req, res) => {
    const positions = await storage.getAllPositions();
    res.json(positions);
  });

  app.get("/api/positions/open", async (req, res) => {
    const positions = await storage.getOpenPositions();
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
    const position = await storage.closePosition(parseInt(req.params.id), exitPrice, new Date());
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json(position);
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
    const { exchange, apiKey, apiSecret } = req.body;
    if (!exchange || !apiKey || !apiSecret) {
      return res.status(400).json({ message: "exchange, apiKey, and apiSecret are required" });
    }
    if (!["BINANCE", "BYBIT"].includes(exchange)) {
      return res.status(400).json({ message: "exchange must be BINANCE or BYBIT" });
    }
    const config = await storage.connectExchange(exchange, apiKey, apiSecret);
    res.json(config);
  });

  app.post("/api/exchange/disconnect", async (req, res) => {
    const config = await storage.disconnectExchange();
    res.json(config);
  });

  return httpServer;
}
