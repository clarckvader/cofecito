import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ProcessType } from "@prisma/client";
import crypto from "crypto";
import { uploadJson } from "../services/ipfs.service.js";
import { getConnection, getBackendKeypair, TRACEABILITY_REGISTRY_PROGRAM_ID } from "../services/solana.service.js";

const lotBody = z.object({
  farmId: z.string(),
  name: z.string(),
  variety: z.string(),
  process: z.nativeEnum(ProcessType),
  harvestDate: z.string().datetime(),
  cuppingScore: z.number().optional(),
  cuppingNotes: z.string().nullish(),
  cupper: z.string().nullish(),
  roastLevel: z.string().nullish(),
  roastDate: z.string().datetime().optional(),
  roaster: z.string().nullish(),
});

const lotsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (req) => {
    const qs = req.query as { farmId?: string; active?: string };
    return fastify.prisma.lot.findMany({
      where: {
        ...(qs.farmId ? { farmId: qs.farmId } : {}),
        ...(qs.active !== undefined ? { active: qs.active === "true" } : {}),
      },
      include: { farm: true },
      orderBy: { createdAt: "desc" },
    });
  });

  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const lot = await fastify.prisma.lot.findUnique({
      where: { id: req.params.id },
      include: { farm: true },
    });
    if (!lot) return reply.status(404).send({ error: "Lot not found" });
    return lot;
  });

  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req) => {
      const data = lotBody.parse(req.body);

      const lot = await fastify.prisma.lot.create({
        data: {
          ...data,
          harvestDate: new Date(data.harvestDate),
          roastDate: data.roastDate ? new Date(data.roastDate) : undefined,
        },
        include: { farm: true },
      });

      // Upload lot JSON to IPFS and register hash on-chain (fire-and-forget)
      registerLotOnChain(fastify, lot).catch((err) =>
        fastify.log.error({ err, lotId: lot.id }, "Failed to register lot on-chain")
      );

      return lot;
    }
  );

  fastify.put<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const data = lotBody.partial().parse(req.body);
      try {
        return await fastify.prisma.lot.update({
          where: { id: req.params.id },
          data: {
            ...data,
            ...(data.harvestDate ? { harvestDate: new Date(data.harvestDate) } : {}),
            ...(data.roastDate ? { roastDate: new Date(data.roastDate) } : {}),
          },
        });
      } catch {
        return reply.status(404).send({ error: "Lot not found" });
      }
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { active: boolean } }>(
    "/:id/active",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      try {
        return await fastify.prisma.lot.update({
          where: { id: req.params.id },
          data: { active: req.body.active },
        });
      } catch {
        return reply.status(404).send({ error: "Lot not found" });
      }
    }
  );
};

async function registerLotOnChain(fastify: any, lot: any) {
  const lotJson = JSON.stringify(lot);
  const cid = await uploadJson(lot, `lot-${lot.id}.json`);
  const hashBytes = crypto.createHash("sha256").update(lotJson).digest();
  const hashHex = hashBytes.toString("hex");

  await fastify.prisma.lot.update({
    where: { id: lot.id },
    data: { metadataIpfs: cid },
  });

  // TODO: invoke traceability_registry program via @coral-xyz/anchor
  // Left as stub until IDL is generated from the Anchor build
  fastify.log.info({ lotId: lot.id, cid, hashHex }, "Lot registered in IPFS");
}

export default lotsRoutes;
