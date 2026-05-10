import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import Redis from "ioredis";
import { config } from "../config.js";

// In-memory fallback used when REDIS_ENABLED=false
class MemoryStore {
  private store = new Map<string, { value: string; expiresAt: number | null }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, exArg?: string, ttl?: number): Promise<"OK"> {
    this.store.set(key, {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : null,
    });
    return "OK";
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async quit(): Promise<"OK"> { return "OK"; }
}

declare module "fastify" {
  interface FastifyInstance {
    redis: Pick<Redis, "get" | "set" | "del" | "quit">;
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (fastify) => {
  if (!config.REDIS_ENABLED) {
    fastify.log.warn("Redis disabled (REDIS_ENABLED=false) — using in-memory fallback");
    fastify.decorate("redis", new MemoryStore() as any);
    return;
  }

  const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });

  redis.on("error", (err) => {
    fastify.log.error({ err }, "Redis error");
  });

  fastify.decorate("redis", redis);

  fastify.addHook("onClose", async () => {
    await redis.quit();
  });
});

export default redisPlugin;
