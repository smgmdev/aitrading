import { storage } from "./storage";
import { randomUUID } from "crypto";

const TRADING_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLAUSDT", "ADAUSDT", "DOGEUSDT"];
const PLATFORMS = ["BINANCE", "BYBIT"];
const SIDES = ["LONG", "SHORT"];

interface SimulationConfig {
  enabled: boolean;
  interval: number;
  tradeChance: number;
}

let simulationConfig: SimulationConfig = {
  enabled: true,
  interval: 15000,
  tradeChance: 0.3,
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPrice(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateAiDecision() {
  const random = Math.random();

  if (random < simulationConfig.tradeChance) {
    const pair = getRandomElement(TRADING_PAIRS);
    const platform = getRandomElement(PLATFORMS);
    const side = getRandomElement(SIDES);
    const leverage = getRandomInt(1, 20);
    const size = parseFloat(getRandomPrice(0.1, 2));
    const entryPrice = parseFloat(getRandomPrice(100, 50000));

    const tradeId = `TRADE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await storage.createPosition({
      tradeId,
      pair,
      side,
      entryPrice: entryPrice.toString(),
      currentPrice: entryPrice.toString(),
      leverage,
      size: size.toString(),
      pnl: "0",
      pnlPercent: "0",
      status: "OPEN",
      platform,
      stopLoss: (entryPrice * (side === "LONG" ? 0.98 : 1.02)).toString(),
      takeProfit: (entryPrice * (side === "LONG" ? 1.05 : 0.95)).toString(),
    });

    await storage.createLog({
      logType: "ENTRY",
      message: `AI opened ${side} position on ${pair} with ${leverage}x leverage`,
      pair,
      relatedTradeId: tradeId,
    });
  }

  // Update open positions with price movements
  const openPositions = await storage.getOpenPositions();

  for (const position of openPositions) {
    const priceChange = getRandomInt(-2, 2) / 100;
    const newPrice = parseFloat(position.currentPrice.toString()) * (1 + priceChange);
    const entryPrice = parseFloat(position.entryPrice.toString());
    const size = parseFloat(position.size.toString());

    const pnl = ((newPrice - entryPrice) * size * position.leverage).toFixed(2);
    const pnlPercent = (((newPrice - entryPrice) / entryPrice) * 100).toFixed(2);

    let shouldClose = false;
    let exitReason = "";
    let newPrice_str = newPrice.toString();

    const stopLoss = position.stopLoss ? parseFloat(position.stopLoss.toString()) : null;
    const takeProfit = position.takeProfit ? parseFloat(position.takeProfit.toString()) : null;

    if (position.side === "LONG") {
      if (stopLoss && newPrice <= stopLoss) {
        shouldClose = true;
        newPrice_str = stopLoss.toString();
        exitReason = "Stop Loss Hit";
      } else if (takeProfit && newPrice >= takeProfit) {
        shouldClose = true;
        newPrice_str = takeProfit.toString();
        exitReason = "Take Profit Hit";
      } else if (Math.random() < 0.1) {
        shouldClose = true;
        exitReason = "AI Exit Signal";
      }
    } else {
      if (stopLoss && newPrice >= stopLoss) {
        shouldClose = true;
        newPrice_str = stopLoss.toString();
        exitReason = "Stop Loss Hit";
      } else if (takeProfit && newPrice <= takeProfit) {
        shouldClose = true;
        newPrice_str = takeProfit.toString();
        exitReason = "Take Profit Hit";
      } else if (Math.random() < 0.1) {
        shouldClose = true;
        exitReason = "AI Exit Signal";
      }
    }

    if (shouldClose) {
      await storage.closePosition(position.id, newPrice_str, new Date());
      await storage.createLog({
        logType: "EXIT",
        message: `AI closed ${position.side} position on ${position.pair}: ${exitReason}. PnL: ${pnl}`,
        pair: position.pair,
        relatedTradeId: position.tradeId,
      });
    } else {
      await storage.updatePosition(position.id, {
        currentPrice: newPrice.toString(),
        pnl: pnl.toString(),
        pnlPercent: pnlPercent.toString(),
      });
    }
  }
}

export function startSimulation() {
  if (!simulationConfig.enabled) return;

  const interval = setInterval(async () => {
    try {
      await generateAiDecision();
    } catch (error) {
      console.error("Simulation error:", error);
    }
  }, simulationConfig.interval);

  console.log("[simulation] Trading simulation started");

  return () => clearInterval(interval);
}

export function updateSimulationConfig(config: Partial<SimulationConfig>) {
  simulationConfig = { ...simulationConfig, ...config };
}
