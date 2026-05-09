import { FastifyPluginAsync } from "fastify";
import crypto from "crypto";
import { config } from "../config.js";

const trazabilidadRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/trazabilidad/lot/:lotId — full public lot data
  fastify.get<{ Params: { lotId: string } }>("/lot/:lotId", async (req, reply) => {
    const lot = await fastify.prisma.lot.findUnique({
      where: { id: req.params.lotId },
      include: { farm: true },
    });
    if (!lot) return reply.status(404).send({ error: "Lot not found" });

    const solscanBase =
      config.SOLANA_CLUSTER === "mainnet-beta"
        ? "https://solscan.io"
        : "https://solscan.io/?cluster=devnet";

    return {
      ...lot,
      solscanUrl: lot.txSignature ? `${solscanBase}/tx/${lot.txSignature}` : null,
      trazabilidadUrl: `${config.APP_URL}/lot/${lot.id}`,
    };
  });

  // GET /api/trazabilidad/verify/:lotId — compare on-chain hash vs current data
  fastify.get<{ Params: { lotId: string } }>("/verify/:lotId", async (req, reply) => {
    const lot = await fastify.prisma.lot.findUnique({
      where: { id: req.params.lotId },
      include: { farm: true },
    });
    if (!lot) return reply.status(404).send({ error: "Lot not found" });
    if (!lot.blockchainHash) {
      return { verified: false, reason: "Lot not yet registered on-chain" };
    }

    // Recompute hash from current data
    const currentHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ ...lot, farm: lot.farm }))
      .digest("hex");

    const verified = currentHash === lot.blockchainHash;

    return {
      verified,
      storedHash: lot.blockchainHash,
      currentHash,
      txSignature: lot.txSignature,
    };
  });
};

export default trazabilidadRoutes;
