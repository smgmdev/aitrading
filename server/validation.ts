import crypto from "crypto";

// Validate Binance API key and secret by making an authenticated request
export async function validateBinanceKeys(apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    const timestamp = Date.now();
    const params = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(params)
      .digest("hex");

    const response = await fetch(
      `https://api.binance.com/api/v3/account?${params}&signature=${signature}`,
      {
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`Binance API error (${response.status}):`, text);
      return false;
    }

    const text = await response.text();
    if (!text) {
      console.error("Binance API returned empty response");
      return false;
    }

    const data = JSON.parse(text);
    // Check if response has expected structure (balances array indicates valid response)
    return Array.isArray(data.balances);
  } catch (error) {
    console.error("Binance validation error:", error);
    return false;
  }
}

// Validate Bybit API key and secret by making an authenticated request
export async function validateBybitKeys(apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    const timestamp = Date.now().toString();
    const recv_window = "5000";
    const params = `api_key=${apiKey}&timestamp=${timestamp}&recv_window=${recv_window}`;
    
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(params)
      .digest("hex");

    const response = await fetch(
      `https://api.bybit.com/v5/account/wallet-balance?${params}&sign=${signature}`,
      {
        headers: {
          "X-BYBIT-SIGN": signature,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`Bybit API error (${response.status}):`, text);
      return false;
    }

    const text = await response.text();
    if (!text) {
      console.error("Bybit API returned empty response");
      return false;
    }

    const data = JSON.parse(text);
    // Check if response has expected structure (retCode 0 indicates success)
    return data.retCode === 0;
  } catch (error) {
    console.error("Bybit validation error:", error);
    return false;
  }
}
