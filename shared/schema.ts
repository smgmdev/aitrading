import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Trading Positions Table
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  tradeId: varchar("trade_id", { length: 50 }).notNull().unique(),
  pair: varchar("pair", { length: 20 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 18, scale: 8 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 18, scale: 8 }),
  leverage: integer("leverage").notNull(),
  size: decimal("size", { precision: 18, scale: 8 }).notNull(),
  pnl: decimal("pnl", { precision: 18, scale: 8 }).notNull().default("0"),
  pnlPercent: decimal("pnl_percent", { precision: 10, scale: 4 }).notNull().default("0"),
  status: varchar("status", { length: 20 }).notNull().default("OPEN"),
  platform: varchar("platform", { length: 20 }).notNull(),
  mode: varchar("mode", { length: 30 }).notNull().default("HFT_SCALPER"),
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 18, scale: 8 }),
  entryTime: timestamp("entry_time").notNull().defaultNow(),
  exitTime: timestamp("exit_time"),
  duration: integer("duration"),
  closedByUser: boolean("closed_by_user").notNull().default(false),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  entryTime: true,
});

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

// AI Decision Logs Table
export const aiLogs = pgTable("ai_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  logType: varchar("log_type", { length: 20 }).notNull(),
  message: text("message").notNull(),
  pair: varchar("pair", { length: 20 }),
  relatedTradeId: varchar("related_trade_id", { length: 50 }),
});

export const insertAiLogSchema = createInsertSchema(aiLogs).omit({
  id: true,
  timestamp: true,
});

export type AiLog = typeof aiLogs.$inferSelect;
export type InsertAiLog = z.infer<typeof insertAiLogSchema>;

// System Configuration Table
export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  connectedExchange: varchar("connected_exchange", { length: 20 }),
  binanceApiKey: text("binance_api_key"),
  binanceApiSecret: text("binance_api_secret"),
  bybitApiKey: text("bybit_api_key"),
  bybitApiSecret: text("bybit_api_secret"),
  testMode: boolean("test_mode").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({
  id: true,
  updatedAt: true,
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
