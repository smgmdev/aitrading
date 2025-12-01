// Momentum Analysis Engine for AI Trading
// Analyzes price action, trend strength, and momentum for autonomous trading decisions

interface PricePoint {
  price: number;
  timestamp: number;
}

interface MomentumAnalysis {
  trend: "STRONG_UP" | "UP" | "NEUTRAL" | "DOWN" | "STRONG_DOWN";
  momentum: number; // -100 to +100
  volatility: number; // 0-100
  trendStrength: number; // 0-100
  recommendation: "BUY" | "SELL" | "HOLD";
}

// Store price history for momentum calculation
const priceHistory: Map<string, PricePoint[]> = new Map();
const MAX_HISTORY_LENGTH = 50;

export function recordPrice(pair: string, price: number): void {
  if (!priceHistory.has(pair)) {
    priceHistory.set(pair, []);
  }
  
  const history = priceHistory.get(pair)!;
  history.push({ price, timestamp: Date.now() });
  
  // Keep only recent history
  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift();
  }
}

export function analyzeMomentum(pair: string, currentPrice: number): MomentumAnalysis {
  const history = priceHistory.get(pair) || [];
  
  if (history.length < 3) {
    return {
      trend: "NEUTRAL",
      momentum: 0,
      volatility: 0,
      trendStrength: 0,
      recommendation: "HOLD",
    };
  }

  // Calculate simple moving average (20-period equivalent from history)
  const recentPrices = history.slice(-20);
  const sma = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
  
  // Calculate momentum (difference from SMA, normalized)
  const momentumValue = ((currentPrice - sma) / sma) * 100;

  // Calculate volatility (standard deviation of recent prices)
  const mean = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
  const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p.price - mean, 2), 0) / recentPrices.length;
  const volatility = Math.sqrt(variance) / mean * 100;

  // Determine trend strength based on RSI-like calculation
  const gains = recentPrices.slice(1).reduce((sum, p, i) => {
    const change = p.price - recentPrices[i].price;
    return sum + (change > 0 ? change : 0);
  }, 0);
  
  const losses = recentPrices.slice(1).reduce((sum, p, i) => {
    const change = recentPrices[i].price - p.price;
    return sum + (change > 0 ? change : 0);
  }, 0);

  const rs = losses > 0 ? gains / losses : (gains > 0 ? 100 : 0);
  const rsi = 100 - (100 / (1 + rs));
  const trendStrength = Math.min(100, rsi > 50 ? rsi : 100 - rsi);

  // Determine trend
  let trend: "STRONG_UP" | "UP" | "NEUTRAL" | "DOWN" | "STRONG_DOWN";
  if (rsi > 70) {
    trend = trendStrength > 80 ? "STRONG_UP" : "UP";
  } else if (rsi < 30) {
    trend = trendStrength > 80 ? "STRONG_DOWN" : "DOWN";
  } else {
    trend = "NEUTRAL";
  }

  // Trading recommendation
  let recommendation: "BUY" | "SELL" | "HOLD";
  if (rsi > 65 && momentumValue > 5) {
    recommendation = "BUY";
  } else if (rsi < 35 && momentumValue < -5) {
    recommendation = "SELL";
  } else {
    recommendation = "HOLD";
  }

  return {
    trend,
    momentum: Math.min(100, Math.max(-100, momentumValue)),
    volatility: Math.min(100, volatility),
    trendStrength,
    recommendation,
  };
}

export function shouldEnterTrade(pair: string, side: "LONG" | "SHORT"): boolean {
  const currentPrice = (priceHistory.get(pair) || []).pop()?.price || 0;
  if (currentPrice === 0) return true; // Allow if no history
  
  const analysis = analyzeMomentum(pair, currentPrice);
  
  // Only enter if momentum aligns with trade direction and trend is favorable
  if (side === "LONG") {
    return analysis.momentum > 10 && (analysis.trend === "UP" || analysis.trend === "STRONG_UP");
  } else {
    return analysis.momentum < -10 && (analysis.trend === "DOWN" || analysis.trend === "STRONG_DOWN");
  }
}

interface TPSLLevels {
  tp1: number; // First take profit (conservative)
  tp2: number; // Second take profit (aggressive)
  sl: number;  // Stop loss
}

export function calculateTPSL(
  entryPrice: number,
  side: "LONG" | "SHORT",
  pair: string,
  volatility: number
): TPSLLevels {
  const analysis = analyzeMomentum(pair, entryPrice);
  
  // Risk/reward ratio based on momentum strength and volatility
  const riskPercent = 1 + (volatility / 100) * 0.5; // Adjust based on volatility
  const rewardMultiplier = analysis.momentum > 30 ? 2.5 : analysis.momentum > 15 ? 2 : 1.5;

  if (side === "LONG") {
    const sl = entryPrice * (1 - (riskPercent / 100));
    const tp1 = entryPrice * (1 + (riskPercent * rewardMultiplier) / 100);
    const tp2 = entryPrice * (1 + (riskPercent * rewardMultiplier * 1.8) / 100);
    
    return { tp1, tp2, sl };
  } else {
    const sl = entryPrice * (1 + (riskPercent / 100));
    const tp1 = entryPrice * (1 - (riskPercent * rewardMultiplier) / 100);
    const tp2 = entryPrice * (1 - (riskPercent * rewardMultiplier * 1.8) / 100);
    
    return { tp1, tp2, sl };
  }
}

interface HFTExitDecision {
  shouldClose: boolean;
  reason: string;
  holdReason?: string;
}

export function analyzeHFTExit(
  pair: string,
  side: "LONG" | "SHORT",
  entryPrice: number,
  currentPrice: number,
  tp1Price: number
): HFTExitDecision {
  const analysis = analyzeMomentum(pair, currentPrice);
  
  // Check if we've hit TP1
  const isAtTP1 = side === "LONG" ? currentPrice >= tp1Price : currentPrice <= tp1Price;
  
  if (!isAtTP1) {
    return { shouldClose: false, reason: "Not at TP1 yet" };
  }

  // Now decide: close for sure profit or wait for momentum to bring more gains?
  
  // Strong momentum in trade direction = hold for more
  const isMomentumStrong = 
    (side === "LONG" && analysis.momentum > 35 && analysis.trend === "STRONG_UP") ||
    (side === "SHORT" && analysis.momentum < -35 && analysis.trend === "STRONG_DOWN");
  
  // Very high volatility with good momentum = opportunity for more gains
  const isVolatilityHigh = analysis.volatility > 25;
  
  // Trend strength indicates sustained move
  const isTrendStrong = analysis.trendStrength > 75;

  // Decision: if ALL three conditions are met, wait for more profit
  if (isMomentumStrong && isVolatilityHigh && isTrendStrong) {
    return {
      shouldClose: false,
      reason: "Momentum Analysis: Strong conditions for extended move",
      holdReason: `Momentum: ${analysis.momentum.toFixed(1)}, Volatility: ${analysis.volatility.toFixed(1)}, Trend Strength: ${analysis.trendStrength.toFixed(1)}`,
    };
  }

  // If momentum is still positive but weaker, lock in the sure profit
  if (analysis.momentum * (side === "LONG" ? 1 : -1) > 10) {
    return {
      shouldClose: false,
      reason: "Moderate momentum - holding for gradual gains",
      holdReason: `Momentum still favorable but not extreme`,
    };
  }

  // Otherwise, close for the guaranteed profit
  return {
    shouldClose: true,
    reason: "Momentum Analysis: Trend weakening - taking sure profit at TP1",
  };
}

export function clearPriceHistory(pair: string): void {
  priceHistory.delete(pair);
}

export function getPriceHistory(pair: string): PricePoint[] {
  return priceHistory.get(pair) || [];
}
