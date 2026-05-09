import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import Redis from "ioredis";
import { config } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (fastify) => {
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
