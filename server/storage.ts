import { 
  positions, aiLogs, systemConfig,
  type Position, type InsertPosition,
  type AiLog, type InsertAiLog,
  type SystemConfig, type InsertSystemConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Positions
  getOpenPositions(): Promise<Position[]>;
  getAllPositions(): Promise<Position[]>;
  getPositionById(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, updates: Partial<InsertPosition>): Promise<Position | undefined>;
  closePosition(id: number, exitPrice: string, exitTime: Date): Promise<Position | undefined>;
  
  // AI Logs
  getRecentLogs(limit?: number): Promise<AiLog[]>;
  createLog(log: InsertAiLog): Promise<AiLog>;
  
  // System Config
  getSystemConfig(): Promise<SystemConfig | undefined>;
  updateSystemConfig(config: Partial<InsertSystemConfig>): Promise<SystemConfig>;
  connectExchange(exchange: string, apiKey: string, apiSecret: string): Promise<SystemConfig>;
  disconnectExchange(): Promise<SystemConfig>;
  getConnectedExchange(): Promise<string | null>;
}

export class DatabaseStorage implements IStorage {
  // Positions
  async getOpenPositions(): Promise<Position[]> {
    return await db.select().from(positions).where(eq(positions.status, "OPEN")).orderBy(desc(positions.entryTime));
  }

  async getAllPositions(): Promise<Position[]> {
    return await db.select().from(positions).orderBy(desc(positions.entryTime)).limit(100);
  }

  async getPositionById(id: number): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.id, id));
    return position || undefined;
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const [newPosition] = await db.insert(positions).values(position).returning();
    return newPosition;
  }

  async updatePosition(id: number, updates: Partial<InsertPosition>): Promise<Position | undefined> {
    const [updated] = await db.update(positions).set(updates).where(eq(positions.id, id)).returning();
    return updated || undefined;
  }

  async closePosition(id: number, exitPrice: string, exitTime: Date): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.id, id));
    if (!position) return undefined;

    const entryTime = position.entryTime;
    const duration = Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000);

    const [updated] = await db
      .update(positions)
      .set({
        exitPrice,
        exitTime,
        duration,
        status: "CLOSED",
      })
      .where(eq(positions.id, id))
      .returning();
    
    return updated || undefined;
  }

  // AI Logs
  async getRecentLogs(limit: number = 20): Promise<AiLog[]> {
    return await db.select().from(aiLogs).orderBy(desc(aiLogs.timestamp)).limit(limit);
  }

  async createLog(log: InsertAiLog): Promise<AiLog> {
    const [newLog] = await db.insert(aiLogs).values(log).returning();
    return newLog;
  }

  // System Config
  async getSystemConfig(): Promise<SystemConfig | undefined> {
    const [config] = await db.select().from(systemConfig).limit(1);
    if (!config) {
      // Create default config if none exists
      const [newConfig] = await db.insert(systemConfig).values({}).returning();
      return newConfig;
    }
    return config;
  }

  async updateSystemConfig(configUpdates: Partial<InsertSystemConfig>): Promise<SystemConfig> {
    const existing = await this.getSystemConfig();
    if (!existing) {
      const [newConfig] = await db.insert(systemConfig).values({}).returning();
      return newConfig;
    }

    const [updated] = await db
      .update(systemConfig)
      .set({ ...configUpdates, updatedAt: new Date() })
      .where(eq(systemConfig.id, existing.id))
      .returning();
    
    return updated;
  }

  async connectExchange(exchange: string, apiKey: string, apiSecret: string): Promise<SystemConfig> {
    const config = await this.getSystemConfig();
    if (!config) {
      const [newConfig] = await db.insert(systemConfig).values({
        connectedExchange: exchange,
        [exchange === "BINANCE" ? "binanceApiKey" : "bybitApiKey"]: apiKey,
        [exchange === "BINANCE" ? "binanceApiSecret" : "bybitApiSecret"]: apiSecret,
      }).returning();
      return newConfig;
    }

    const updates: any = {
      connectedExchange: exchange,
      updatedAt: new Date(),
    };
    if (exchange === "BINANCE") {
      updates.binanceApiKey = apiKey;
      updates.binanceApiSecret = apiSecret;
    } else {
      updates.bybitApiKey = apiKey;
      updates.bybitApiSecret = apiSecret;
    }

    const [updated] = await db.update(systemConfig).set(updates).where(eq(systemConfig.id, config.id)).returning();
    return updated;
  }

  async disconnectExchange(): Promise<SystemConfig> {
    const config = await this.getSystemConfig();
    if (!config) {
      const [newConfig] = await db.insert(systemConfig).values({
        connectedExchange: null,
      }).returning();
      return newConfig;
    }

    const [updated] = await db.update(systemConfig).set({ connectedExchange: null, updatedAt: new Date() }).where(eq(systemConfig.id, config.id)).returning();
    return updated;
  }

  async getConnectedExchange(): Promise<string | null> {
    const config = await this.getSystemConfig();
    return config?.connectedExchange || null;
  }
}

export const storage = new DatabaseStorage();
