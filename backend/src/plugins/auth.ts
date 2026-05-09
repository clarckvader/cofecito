import fp from "fastify-plugin";
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import jwt from "@fastify/jwt";
import { config } from "../config.js";

export type JwtPayload = {
  sub: string;
  role: "admin" | "barista" | "consumer";
  truckId?: string;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: JwtPayload["role"]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: "7d" },
  });

  fastify.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });

  fastify.decorate(
    "requireRole",
    (role: JwtPayload["role"]) =>
      async (req: FastifyRequest, reply: FastifyReply) => {
        try {
          await req.jwtVerify();
          if (req.user.role !== role && req.user.role !== "admin") {
            reply.status(403).send({ error: "Forbidden" });
          }
        } catch {
          reply.status(401).send({ error: "Unauthorized" });
        }
      }
  );
});

export default authPlugin;
