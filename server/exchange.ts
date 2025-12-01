import axios from "axios";
import * as crypto from "crypto";

export interface ExchangePrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface ExchangeConfig {
  apiKey: string;
  apiSecret: string;
}

// Binance API Client
export class BinanceClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.binance.com/api/v3";

  constructor(config: ExchangeConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  private getSignature(data: string): string {
    return crypto.createHmac("sha256", this.apiSecret).update(data).digest("hex");
  }

  async getPrice(symbol: string): Promise<ExchangePrice> {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/price`, {
        params: { symbol },
        timeout: 5000,
      });
      return {
        symbol: response.data.symbol,
        price: parseFloat(response.data.price),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Binance price fetch error for ${symbol}:`, error);
      throw error;
    }
  }

  async getPrices(symbols: string[]): Promise<ExchangePrice[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/price`, {
        timeout: 5000,
      });
      
      const prices: ExchangePrice[] = [];
      for (const data of response.data) {
        if (symbols.includes(data.symbol)) {
          prices.push({
            symbol: data.symbol,
            price: parseFloat(data.price),
            timestamp: Date.now(),
          });
        }
      }
      return prices;
    } catch (error) {
      console.error("Binance prices fetch error:", error);
      throw error;
    }
  }

  async validate(): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const query = `timestamp=${timestamp}`;
      const signature = this.getSignature(query);
      
      const response = await axios.get(`${this.baseUrl}/account`, {
        headers: {
          "X-MBX-APIKEY": this.apiKey,
        },
        params: {
          timestamp,
          signature,
        },
        timeout: 5000,
      });
      
      return !!response.data.balances;
    } catch (error) {
      console.error("Binance validation error:", error);
      return false;
    }
  }
}

// Bybit API Client
export class BybitClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = "https://api.bybit.com/v5";

  constructor(config: ExchangeConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  private getSignature(payload: string, timestamp: string): string {
    const message = timestamp + this.apiKey + payload;
    return crypto.createHmac("sha256", this.apiSecret).update(message).digest("hex");
  }

  async getPrice(symbol: string): Promise<ExchangePrice> {
    try {
      const response = await axios.get(`${this.baseUrl}/market/tickers`, {
        params: {
          category: "linear",
          symbol: symbol.replace("USDT", ""),
        },
        timeout: 5000,
      });

      if (response.data.result?.list?.length > 0) {
        const data = response.data.result.list[0];
        return {
          symbol: symbol,
          price: parseFloat(data.lastPrice),
          timestamp: Date.now(),
        };
      }
      throw new Error("No price data returned");
    } catch (error) {
      console.error(`Bybit price fetch error for ${symbol}:`, error);
      throw error;
    }
  }

  async getPrices(symbols: string[]): Promise<ExchangePrice[]> {
    try {
      const prices: ExchangePrice[] = [];
      
      for (const symbol of symbols) {
        const price = await this.getPrice(symbol);
        prices.push(price);
      }
      
      return prices;
    } catch (error) {
      console.error("Bybit prices fetch error:", error);
      throw error;
    }
  }

  async validate(): Promise<boolean> {
    try {
      const timestamp = Date.now().toString();
      const payload = "";
      const signature = this.getSignature(payload, timestamp);

      const response = await axios.get(`${this.baseUrl}/account/wallet-balance`, {
        headers: {
          "X-BYBIT-SIGN": signature,
          "X-BYBIT-API-KEY": this.apiKey,
          "X-BYBIT-TIMESTAMP": timestamp,
        },
        params: {
          accountType: "UNIFIED",
        },
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      console.error("Bybit validation error:", error);
      return false;
    }
  }
}

// Mock price generator for test mode
export class MockExchangeClient {
  private priceCache: Map<string, number> = new Map();

  constructor() {
    // Initialize with realistic starting prices
    const pairs = ["BTCUSDT", "ETHUSDT", "SOLAUSDT", "ADAUSDT", "DOGEUSDT"];
    const startPrices: { [key: string]: number } = {
      BTCUSDT: 42000,
      ETHUSDT: 2500,
      SOLAUSDT: 150,
      ADAUSDT: 0.95,
      DOGEUSDT: 0.30,
    };

    for (const pair of pairs) {
      this.priceCache.set(pair, startPrices[pair] || 100);
    }
  }

  async getPrice(symbol: string): Promise<ExchangePrice> {
    const basePrice = this.priceCache.get(symbol) || 100;
    // Simulate 0.5-1% price movement
    const change = (Math.random() - 0.5) * 0.02;
    const newPrice = basePrice * (1 + change);
    this.priceCache.set(symbol, newPrice);

    return {
      symbol,
      price: newPrice,
      timestamp: Date.now(),
    };
  }

  async getPrices(symbols: string[]): Promise<ExchangePrice[]> {
    const prices: ExchangePrice[] = [];
    for (const symbol of symbols) {
      prices.push(await this.getPrice(symbol));
    }
    return prices;
  }

  async validate(): Promise<boolean> {
    return true;
  }
}

export type ExchangeClient = BinanceClient | BybitClient | MockExchangeClient;

export function createExchangeClient(
  exchange: string,
  config?: ExchangeConfig
): ExchangeClient {
  if (exchange === "BINANCE" && config) {
    return new BinanceClient(config);
  } else if (exchange === "BYBIT" && config) {
    return new BybitClient(config);
  }
  return new MockExchangeClient();
}
