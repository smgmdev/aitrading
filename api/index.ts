import express from "express";
import path from "path";
import fs from "fs";
import pg from "pg";

const { Pool } = pg;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize database connection
let db: any = null;

async function getDb() {
  if (db && db.pool) return db;
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  // Convert to Transaction mode (port 6543) for better serverless support
  let connectionString = process.env.DATABASE_URL;
  if (connectionString.includes(":5432/")) {
    connectionString = connectionString.replace(":5432/", ":6543/");
  }

  const pool = new Pool({ 
    connectionString,
    max: 2,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

  // Handle pool errors
  pool.on('error', (err: any) => {
    console.error('Pool error:', err);
    db = null;
  });

  db = { pool };
  return db;
}

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
    return result;
  }
  return obj;
}

// ===== POSITIONS ENDPOINTS =====

app.get("/api/positions", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const result = await client.query(
      "SELECT * FROM positions ORDER BY COALESCE(entry_time, NOW()) DESC"
    );
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error("Positions error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.get("/api/positions/open", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    // Try different variations of status value
    const result = await client.query(
      `SELECT * FROM positions 
       WHERE LOWER(status) = 'open' OR LOWER(status) = 'active'
       ORDER BY entry_time DESC NULLS LAST`
    );
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error("Open positions error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.get("/api/positions/closed", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await client.query(
      `SELECT * FROM positions 
       WHERE LOWER(status) = 'closed'
       ORDER BY exit_time DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error("Closed positions error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.get("/api/positions/manually-closed", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await client.query(
      `SELECT * FROM positions 
       WHERE LOWER(status) = 'closed' AND closed_by_user = true
       ORDER BY exit_time DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error("Manually closed positions error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.post("/api/positions/:id/close", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const positionId = parseInt(req.params.id);
    const { exitPrice } = req.body;

    if (!exitPrice) {
      return res.status(400).json({ error: "exitPrice is required" });
    }

    const result = await client.query(
      `UPDATE positions 
       SET status = 'CLOSED', exit_price = $1, exit_time = NOW(), closed_by_user = true
       WHERE id = $2 
       RETURNING *`,
      [exitPrice, positionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Position not found" });
    }

    res.json(toCamelCase(result.rows[0]));
  } catch (err: any) {
    console.error("Close position error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// ===== LOGS ENDPOINT =====

app.get("/api/logs", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await client.query(
      "SELECT * FROM ai_logs ORDER BY id DESC LIMIT $1",
      [limit]
    );
    res.json(toCamelCase(result.rows));
  } catch (err: any) {
    console.error("Logs error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// ===== EXCHANGE ENDPOINTS =====

app.get("/api/exchange/connected", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const result = await client.query(
      "SELECT connected_exchange FROM system_config LIMIT 1"
    );
    const config = result.rows[0];
    res.json({ connected: config?.connected_exchange || "BINANCE" });
  } catch (err: any) {
    console.error("Exchange connected error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.post("/api/exchange/connect", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const { exchange } = req.body;

    if (!exchange || !["BINANCE", "BYBIT"].includes(exchange)) {
      return res.status(400).json({ error: "Invalid exchange" });
    }

    const result = await client.query(
      "UPDATE system_config SET connected_exchange = $1 RETURNING *",
      [exchange]
    );

    res.json(toCamelCase(result.rows[0]));
  } catch (err: any) {
    console.error("Exchange connect error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.post("/api/exchange/disconnect", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();

    await client.query(
      "UPDATE system_config SET connected_exchange = NULL"
    );

    res.json({ status: "disconnected" });
  } catch (err: any) {
    console.error("Exchange disconnect error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// ===== CONFIG ENDPOINT =====

app.get("/api/config", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const result = await client.query(
      "SELECT * FROM system_config LIMIT 1"
    );
    res.json(toCamelCase(result.rows[0] || {}));
  } catch (err: any) {
    console.error("Config error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// ===== TRADING PAIRS ENDPOINT =====

app.get("/api/trading-pairs", async (req, res) => {
  try {
    const pairs = [
      "BTCUSDT", "ETHUSDT", "SOLAUSDT", "ADAUSDT", "DOGEUSDT",
      "XRPUSDT", "BNBUSDT", "AVAXUSDT", "LINKUSDT", "MATICUSDT",
      "LITUSDT", "APTUSDT", "UNIUSDT", "ARBUSDT", "OPUSDT",
    ];
    res.json(pairs);
  } catch (err: any) {
    console.error("Trading pairs error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== HEALTH CHECK =====

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ===== 404 HANDLER =====

app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ===== FRONTEND ROUTING =====

app.get("*", (req, res) => {
  try {
    const indexPath = path.join(__dirname, "../dist/public/index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Frontend not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
