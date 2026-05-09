import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";

import { config } from "./config.js";
import prismaPlugin from "./plugins/prisma.js";
import redisPlugin from "./plugins/redis.js";
import authPlugin from "./plugins/auth.js";

import authRoutes from "./routes/auth.js";
import farmsRoutes from "./routes/farms.js";
import lotsRoutes from "./routes/lots.js";
import trucksRoutes from "./routes/trucks.js";
import menusRoutes from "./routes/menus.js";
import cupsRoutes from "./routes/cups.js";
import nftsRoutes from "./routes/nfts.js";
import voiceRoutes from "./routes/voice.js";
import trazabilidadRoutes from "./routes/trazabilidad.js";
import rampRoutes from "./routes/ramp.js";
import feedbackRoutes from "./routes/feedback.js";

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } }
        : undefined,
  },
});

async function build() {
  // Core plugins
  await server.register(cors, {
    origin: [config.APP_URL, "http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  });

  await server.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

  await server.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    redis: undefined, // will use in-memory for now; swap to redis instance post-boot
  });

  await server.register(prismaPlugin);
  await server.register(redisPlugin);
  await server.register(authPlugin);

  // Health check
  server.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

  // API routes
  const prefix = "/api";
  await server.register(authRoutes,         { prefix: `${prefix}/auth` });
  await server.register(farmsRoutes,        { prefix: `${prefix}/farms` });
  await server.register(lotsRoutes,         { prefix: `${prefix}/lots` });
  await server.register(trucksRoutes,       { prefix: `${prefix}/trucks` });
  await server.register(menusRoutes,        { prefix: `${prefix}/menus` });
  await server.register(cupsRoutes,         { prefix: `${prefix}/cups` });
  await server.register(nftsRoutes,         { prefix: `${prefix}/nfts` });
  await server.register(voiceRoutes,        { prefix: `${prefix}/voice` });
  await server.register(trazabilidadRoutes, { prefix: `${prefix}/trazabilidad` });
  await server.register(rampRoutes,         { prefix: `${prefix}/ramp` });
  await server.register(feedbackRoutes,     { prefix: `${prefix}/feedback` });

  return server;
}

build()
  .then((app) =>
    app.listen({ port: config.PORT, host: "0.0.0.0" }, (err) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
    })
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
