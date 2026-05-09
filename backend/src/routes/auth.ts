import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { JwtPayload } from "../plugins/auth.js";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const siws = {
  nonce: z.object({ walletAddress: z.string() }),
  verify: z.object({
    walletAddress: z.string(),
    nonce: z.string(),
    signature: z.string(),
  }),
};

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Barista / admin login with username + password
  fastify.post("/login", async (req, reply) => {
    const body = loginSchema.parse(req.body);

    // Admin hardcoded check (replace with DB lookup in production)
    if (body.username === "admin") {
      const valid = body.password === process.env.ADMIN_PASSWORD;
      if (!valid) return reply.status(401).send({ error: "Invalid credentials" });

      const payload: JwtPayload = { sub: "admin", role: "admin" };
      return { token: fastify.jwt.sign(payload) };
    }

    // Barista lookup by username (stored as barista name for MVP)
    const barista = await fastify.prisma.barista.findFirst({
      where: { name: body.username },
      include: { truck: true },
    });

    if (!barista) return reply.status(401).send({ error: "Invalid credentials" });
    // In production, hash+compare password. For MVP we skip.

    const payload: JwtPayload = {
      sub: barista.id,
      role: "barista",
      truckId: barista.truckId,
    };
    return { token: fastify.jwt.sign(payload) };
  });

  // Step 1: get nonce for SIWS
  fastify.post("/siws/nonce", async (req, reply) => {
    const { walletAddress } = siws.nonce.parse(req.body);
    const nonce = crypto.randomUUID();
    const key = `siws:nonce:${walletAddress}`;
    await fastify.redis.set(key, nonce, "EX", 300); // 5 min TTL
    return { nonce };
  });

  // Step 2: verify SIWS signature → issue JWT
  fastify.post("/siws/verify", async (req, reply) => {
    const { walletAddress, nonce, signature } = siws.verify.parse(req.body);

    const stored = await fastify.redis.get(`siws:nonce:${walletAddress}`);
    if (!stored || stored !== nonce) {
      return reply.status(400).send({ error: "Invalid or expired nonce" });
    }

    // Verify ed25519 signature
    const message = new TextEncoder().encode(
      `Sign in to Cofecito\nWallet: ${walletAddress}\nNonce: ${nonce}`
    );
    const pubkeyBytes = bs58.decode(walletAddress);
    const sigBytes = bs58.decode(signature);

    const valid = nacl.sign.detached.verify(message, sigBytes, pubkeyBytes);
    if (!valid) return reply.status(401).send({ error: "Invalid signature" });

    await fastify.redis.del(`siws:nonce:${walletAddress}`);

    const payload: JwtPayload = { sub: walletAddress, role: "consumer" };
    return { token: fastify.jwt.sign(payload) };
  });
};

export default authRoutes;
