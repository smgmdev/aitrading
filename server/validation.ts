import crypto from "crypto";

// Validate Binance API key and secret by making an authenticated request
export async function validateBinanceKeys(apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    console.log("[BINANCE] Starting validation...");
    console.log("[BINANCE] Received credentials - Key length:", apiKey?.length, "Secret length:", apiSecret?.length);
    
    if (!apiKey || !apiSecret) {
      console.error("[BINANCE] Missing API credentials! Key:", !!apiKey, "Secret:", !!apiSecret);
      return false;
    }
    
    const timestamp = Date.now();
    const params = `timestamp=${timestamp}`;
    console.log("[BINANCE] Creating signature with params:", params);
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(params)
      .digest("hex");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("[BINANCE] Request timeout");
      controller.abort();
    }, 10000); // 10 second timeout

    try {
      console.log("[BINANCE] Sending request to API...");
      const response = await fetch(
        `https://api.binance.com/api/v3/account?${params}&signature=${signature}`,
        {
          headers: {
            "X-MBX-APIKEY": apiKey,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log(`[BINANCE] Response status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[BINANCE] API error (${response.status}):`, text.substring(0, 200));
        return false;
      }

      const text = await response.text();
      if (!text) {
        console.error("[BINANCE] Empty response");
        return false;
      }

      console.log("[BINANCE] Parsing JSON response...");
      const data = JSON.parse(text);
      const hasBalances = Array.isArray(data.balances);
      console.log(`[BINANCE] Validation result: ${hasBalances}`);
      return hasBalances;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[BINANCE] Fetch error:", {
        message: error.message,
        name: error.name,
      });
      throw error;
    }
  } catch (error: any) {
    console.error("[BINANCE] Validation failed:", error.message);
    return false;
  }
}

// Validate Bybit API key and secret by making an authenticated request
export async function validateBybitKeys(apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    console.log("[BYBIT] Starting validation...");
    console.log("[BYBIT] Received credentials - Key length:", apiKey?.length, "Secret length:", apiSecret?.length);
    
    if (!apiKey || !apiSecret) {
      console.error("[BYBIT] Missing API credentials! Key:", !!apiKey, "Secret:", !!apiSecret);
      return false;
    }
    
    const timestamp = Date.now().toString();
    const recv_window = "5000";
    const params = `api_key=${apiKey}&timestamp=${timestamp}&recv_window=${recv_window}`;
    console.log("[BYBIT] Creating signature with params (api_key=***&timestamp=...&recv_window=...)");
    
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(params)
      .digest("hex");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("[BYBIT] Request timeout");
      controller.abort();
    }, 10000); // 10 second timeout

    try {
      console.log("[BYBIT] Sending request to API...");
      const response = await fetch(
        `https://api.bybit.com/v5/account/wallet-balance?${params}&sign=${signature}`,
        {
          headers: {
            "X-BYBIT-SIGN": signature,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log(`[BYBIT] Response status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[BYBIT] API error (${response.status}):`, text.substring(0, 200));
        return false;
      }

      const text = await response.text();
      if (!text) {
        console.error("[BYBIT] Empty response");
        return false;
      }

      console.log("[BYBIT] Parsing JSON response...");
      const data = JSON.parse(text);
      const isValid = data.retCode === 0;
      console.log(`[BYBIT] Validation result: ${isValid}`);
      return isValid;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[BYBIT] Fetch error:", {
        message: error.message,
        name: error.name,
      });
      throw error;
    }
  } catch (error: any) {
    console.error("[BYBIT] Validation failed:", error.message);
    return false;
  }
}
