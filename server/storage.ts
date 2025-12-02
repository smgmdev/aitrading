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
  getClosedPositions(limit?: number): Promise<Position[]>;
  getManuallyClosedPositions(limit?: number): Promise<Position[]>;
  getAllPositions(): Promise<Position[]>;
  getPositionById(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, updates: Partial<InsertPosition>): Promise<Position | undefined>;
  closePosition(id: number, exitPrice: string, exitTime: Date): Promise<Position | undefined>;
  closePositionByUser(id: number, exitPrice: string, exitTime: Date): Promise<Position | undefined>;
  
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

  async getClosedPositions(limit: number = 50): Promise<Position[]> {
    return await db.select().from(positions).where(and(eq(positions.status, "CLOSED"), eq(positions.closedByUser, false))).orderBy(desc(positions.exitTime)).limit(limit);
  }

  async getManuallyClosedPositions(limit: number = 50): Promise<Position[]> {
    return await db.select().from(positions).where(and(eq(positions.status, "CLOSED"), eq(positions.closedByUser, true))).orderBy(desc(positions.exitTime)).limit(limit);
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
        closedByUser: false,
      })
      .where(eq(positions.id, id))
      .returning();
    
    return updated || undefined;
  }

  async closePositionByUser(id: number, exitPrice: string, exitTime: Date): Promise<Position | undefined> {
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
        closedByUser: true,
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
    console.log("[DB] connectExchange - getting current config...");
    const config = await this.getSystemConfig();
    console.log("[DB] connectExchange - current config:", { id: config?.id, exchange: config?.connectedExchange });
    
    // Prepare the values object with the proper API key fields
    let insertValues: any = {
      connectedExchange: exchange,
    };
    
    if (exchange === "BINANCE") {
      insertValues.binanceApiKey = apiKey;
      insertValues.binanceApiSecret = apiSecret;
    } else {
      insertValues.bybitApiKey = apiKey;
      insertValues.bybitApiSecret = apiSecret;
    }
    
    if (!config) {
      console.log("[DB] connectExchange - inserting new config...");
      const result = await db.insert(systemConfig).values(insertValues).returning();
      
      console.log("[DB] connectExchange - insert result:", { result, length: result.length });
      const [newConfig] = result;
      if (!newConfig) {
        throw new Error("Failed to insert new config - returning empty");
      }
      console.log("[DB] connectExchange - inserted successfully:", { id: newConfig.id, exchange: newConfig.connectedExchange });
      return newConfig;
    }

    console.log("[DB] connectExchange - updating existing config id:", config.id);
    const updates: any = {
      ...insertValues,
      updatedAt: new Date(),
    };

    console.log("[DB] connectExchange - update values:", { id: config.id, exchange, hasApiKey: !!apiKey, hasApiSecret: !!apiSecret });
    const result = await db.update(systemConfig).set(updates).where(eq(systemConfig.id, config.id)).returning();
    
    console.log("[DB] connectExchange - update result:", { result, length: result.length });
    const [updated] = result;
    
    if (!updated) {
      throw new Error("Failed to update config - returning empty");
    }
    console.log("[DB] connectExchange - updated successfully:", { id: updated.id, exchange: updated.connectedExchange });
    return updated;
  }

  async disconnectExchange(): Promise<SystemConfig> {
    const config = await this.getSystemConfig();
    if (!config) {
      const [newConfig] = await db.insert(systemConfig).values({
        connectedExchange: null,
        binanceApiKey: null,
        binanceApiSecret: null,
        bybitApiKey: null,
        bybitApiSecret: null,
      }).returning();
      return newConfig;
    }

    const [updated] = await db.update(systemConfig).set({ 
      connectedExchange: null,
      binanceApiKey: null,
      binanceApiSecret: null,
      bybitApiKey: null,
      bybitApiSecret: null,
      updatedAt: new Date() 
    }).where(eq(systemConfig.id, config.id)).returning();
    return updated;
  }

  async getConnectedExchange(): Promise<string | null> {
    const config = await this.getSystemConfig();
    
    // Only return as connected if both exchange name and API keys exist
    if (!config?.connectedExchange) {
      return null;
    }
    
    const exchange = config.connectedExchange.toUpperCase();
    
    if (exchange === "BINANCE") {
      if (config.binanceApiKey && config.binanceApiSecret) {
        return "BINANCE";
      }
    } else if (exchange === "BYBIT") {
      if (config.bybitApiKey && config.bybitApiSecret) {
        return "BYBIT";
      }
    }
    
    return null;
  }
}

export const storage = new DatabaseStorage();
