import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import { pinoHttp } from "pino-http";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/api.js";

const app = express();

const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",
      "req.body.email",
      "req.body.fullName",
      "req.body.contactNumber",
    ],
    censor: "[REDACTED]",
  },
});

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL.split(",").map((url) => url.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(pinoHttp({ logger }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ernel-joy-wedding-api",
    timestamp: new Date().toISOString(),
  });
});

// Register public and protected feature routes.
app.use("/api", apiRouter);

app.get("/api", (_req, res) => {
  res.status(200).json({
    message: "Ernel & Joy Wedding API",
    status: "ready",
    version: 1,
  });
});

// Handle unknown routes.
app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

// Handle errors forwarded by route handlers.
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error({ err: error }, "Request processing failed");

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      error:
        env.NODE_ENV === "production"
          ? "Internal server error."
          : error instanceof Error
            ? error.message
            : "Unknown error.",
    });
  },
);

app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      frontendUrl: env.FRONTEND_URL,
    },
    "Ernel & Joy Wedding API is running",
  );
});