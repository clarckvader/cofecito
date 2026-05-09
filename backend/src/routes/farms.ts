import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const farmBody = z.object({
  name: z.string(),
  country: z.string().optional(),
  region: z.string(),
  altitude: z.number().int(),
  lat: z.number(),
  lng: z.number(),
  producer: z.string(),
  story: z.string().optional(),
  photoIpfs: z.string().optional(),
});

const farmsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async () => {
    return fastify.prisma.farm.findMany({ include: { lots: { select: { id: true, name: true } } } });
  });

  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const farm = await fastify.prisma.farm.findUnique({
      where: { id: req.params.id },
      include: { lots: true },
    });
    if (!farm) return reply.status(404).send({ error: "Farm not found" });
    return farm;
  });

  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req) => {
      const data = farmBody.parse(req.body);
      return fastify.prisma.farm.create({ data });
    }
  );

  fastify.put<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const data = farmBody.partial().parse(req.body);
      try {
        return await fastify.prisma.farm.update({ where: { id: req.params.id }, data });
      } catch {
        return reply.status(404).send({ error: "Farm not found" });
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      try {
        await fastify.prisma.farm.delete({ where: { id: req.params.id } });
        return { ok: true };
      } catch {
        return reply.status(404).send({ error: "Farm not found" });
      }
    }
  );
};

export default farmsRoutes;
