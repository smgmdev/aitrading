import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";
import { startSimulation } from "../server/simulation";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function initialize() {
  if (initialized) return;
  initialized = true;

  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  try {
    startSimulation();
  } catch (e) {
    console.log("Simulation already running or initialization skipped");
  }
}

// Initialize on first request
app.use(async (req, res, next) => {
  await initialize();
  next();
});

export default app;
