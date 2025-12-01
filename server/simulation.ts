import { storage } from "./storage";
import { randomUUID } from "crypto";
import { 
  recordPrice, 
  analyzeMomentum, 
  shouldEnterTrade, 
  calculateTPSL,
  analyzeHFTExit,
  getPriceHistory 
} from "./momentumAnalysis";

const TRADING_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLAUSDT", "ADAUSDT", "DOGEUSDT"];
const PLATFORMS = ["BINANCE", "BYBIT"];
const SIDES = ["LONG", "SHORT"];
const MODES = ["HFT_SCALPER", "TECHNICAL_SWING"];

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
    const side = getRandomElement(SIDES) as "LONG" | "SHORT";
    
    // Analyze momentum before entering trade
    const history = getPriceHistory(pair);
    let shouldTrade = true;
    
    if (history.length > 0) {
      shouldTrade = shouldEnterTrade(pair, side);
    }
    
    if (!shouldTrade) {
      // Momentum doesn't align - skip this entry opportunity
      return;
    }

    const leverage = getRandomInt(1, 20);
    const size = parseFloat(getRandomPrice(0.1, 2));
    const entryPrice = parseFloat(getRandomPrice(100, 50000));

    const tradeId = `TRADE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const mode = getRandomElement(MODES);
    
    // Calculate TP and SL based on momentum analysis
    const analysis = analyzeMomentum(pair, entryPrice);
    const tpsl = calculateTPSL(entryPrice, side, pair, analysis.volatility);

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
      mode,
      stopLoss: tpsl.sl.toString(),
      takeProfit: tpsl.tp1.toString(),
    });

    const modeLabel = mode === "HFT_SCALPER" ? "HFT SCALPER" : "TECHNICAL SWING";
    const momentumIndicator = analysis.momentum > 0 ? "⬆" : "⬇";
    await storage.createLog({
      logType: "ENTRY",
      message: `AI opened ${side} position on ${pair} with ${leverage}x leverage [${modeLabel} mode] - Momentum: ${analysis.momentum.toFixed(1)}% ${momentumIndicator}`,
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
    
    // Record price in momentum history
    recordPrice(position.pair, newPrice);

    const pnl = ((newPrice - entryPrice) * size * position.leverage).toFixed(2);
    const pnlPercent = (((newPrice - entryPrice) / entryPrice) * 100).toFixed(2);

    let shouldClose = false;
    let exitReason = "";
    let newPrice_str = newPrice.toString();

    const stopLoss = position.stopLoss ? parseFloat(position.stopLoss.toString()) : null;
    const takeProfit = position.takeProfit ? parseFloat(position.takeProfit.toString()) : null;
    const side = position.side as "LONG" | "SHORT";

    // Check stop loss first
    if (position.side === "LONG") {
      if (stopLoss && newPrice <= stopLoss) {
        shouldClose = true;
        newPrice_str = stopLoss.toString();
        exitReason = "Stop Loss Hit";
      } else if (takeProfit && newPrice >= takeProfit) {
        // For HFT mode, analyze momentum before closing at TP
        if (position.mode === "HFT_SCALPER") {
          const exitDecision = analyzeHFTExit(position.pair, side, entryPrice, newPrice, takeProfit);
          if (exitDecision.shouldClose) {
            shouldClose = true;
            newPrice_str = takeProfit.toString();
            exitReason = exitDecision.reason;
          } else {
            exitReason = exitDecision.holdReason || exitDecision.reason;
          }
        } else {
          // TECHNICAL_SWING mode: take profit normally
          shouldClose = true;
          newPrice_str = takeProfit.toString();
          exitReason = "Take Profit Hit";
        }
      }
    } else {
      if (stopLoss && newPrice >= stopLoss) {
        shouldClose = true;
        newPrice_str = stopLoss.toString();
        exitReason = "Stop Loss Hit";
      } else if (takeProfit && newPrice <= takeProfit) {
        // For HFT mode, analyze momentum before closing at TP
        if (position.mode === "HFT_SCALPER") {
          const exitDecision = analyzeHFTExit(position.pair, side, entryPrice, newPrice, takeProfit);
          if (exitDecision.shouldClose) {
            shouldClose = true;
            newPrice_str = takeProfit.toString();
            exitReason = exitDecision.reason;
          } else {
            exitReason = exitDecision.holdReason || exitDecision.reason;
          }
        } else {
          // TECHNICAL_SWING mode: take profit normally
          shouldClose = true;
          newPrice_str = takeProfit.toString();
          exitReason = "Take Profit Hit";
        }
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
      
      // Log HFT hold decision if applicable
      if (!shouldClose && position.mode === "HFT_SCALPER" && takeProfit && 
          ((side === "LONG" && newPrice >= takeProfit) || (side === "SHORT" && newPrice <= takeProfit))) {
        await storage.createLog({
          logType: "ENTRY",
          message: `HFT Mode: Holding position - ${exitReason}`,
          pair: position.pair,
          relatedTradeId: position.tradeId,
        });
      }
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
