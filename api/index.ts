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
  if (db) return db;
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
  });
  
  db = { pool };
  return db;
}

// Logs endpoint
app.get("/api/logs", async (req, res) => {
  try {
    const database = await getDb();
    const result = await database.pool.query(
      "SELECT * FROM ai_logs ORDER BY id DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error("Logs error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Positions endpoints
app.get("/api/positions", async (req, res) => {
  try {
    const database = await getDb();
    const result = await database.pool.query("SELECT * FROM positions");
    res.json(result.rows);
  } catch (err: any) {
    console.error("Positions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/positions/open", async (req, res) => {
  try {
    const database = await getDb();
    const result = await database.pool.query(
      "SELECT * FROM positions WHERE status = 'OPEN' ORDER BY entry_time DESC"
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error("Open positions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/positions/closed", async (req, res) => {
  try {
    const database = await getDb();
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await database.pool.query(
      "SELECT * FROM positions WHERE status = 'CLOSED' ORDER BY exit_time DESC LIMIT $1",
      [limit]
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error("Closed positions error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Exchange connected endpoint
app.get("/api/exchange/connected", async (req, res) => {
  try {
    const database = await getDb();
    const result = await database.pool.query(
      "SELECT connected_exchange FROM system_config LIMIT 1"
    );
    const config = result.rows[0];
    res.json({ connected: config?.connected_exchange || "BINANCE" });
  } catch (err: any) {
    console.error("Exchange connected error:", err.message);
    res.status(500).json({ error: err.message });
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
