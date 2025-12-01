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
    db = null; // Reset on error to force reconnection
  });

  db = { pool };
  return db;
}

// Logs endpoint
app.get("/api/logs", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const result = await client.query(
      "SELECT * FROM ai_logs ORDER BY id DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error("Logs error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Positions endpoints
app.get("/api/positions", async (req, res) => {
  let client;
  try {
    const database = await getDb();
    client = await database.pool.connect();
    const result = await client.query("SELECT * FROM positions");
    res.json(result.rows);
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
    const result = await client.query(
      "SELECT * FROM positions WHERE status = 'OPEN' ORDER BY entry_time DESC"
    );
    res.json(result.rows);
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
      "SELECT * FROM positions WHERE status = 'CLOSED' ORDER BY exit_time DESC LIMIT $1",
      [limit]
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error("Closed positions error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Exchange connected endpoint
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

// Catch-all for 404 on API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Serve frontend
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
