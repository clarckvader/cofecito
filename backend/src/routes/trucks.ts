import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const truckBody = z.object({
  name: z.string(),
  location: z.string(),
  lat: z.number(),
  lng: z.number(),
  active: z.boolean().optional(),
});

const baristaBody = z.object({
  name: z.string(),
  truckId: z.string(),
});

const trucksRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (req) => {
    const qs = req.query as { active?: string };
    return fastify.prisma.truck.findMany({
      where: qs.active !== undefined ? { active: qs.active === "true" } : {},
      include: { baristas: true },
    });
  });

  fastify.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const truck = await fastify.prisma.truck.findUnique({
      where: { id: req.params.id },
      include: { baristas: true, menuItems: { include: { lot: { include: { farm: true } } } } },
    });
    if (!truck) return reply.status(404).send({ error: "Truck not found" });
    return truck;
  });

  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req) => {
      const data = truckBody.parse(req.body);
      return fastify.prisma.truck.create({ data });
    }
  );

  fastify.put<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const data = truckBody.partial().parse(req.body);
      try {
        return await fastify.prisma.truck.update({ where: { id: req.params.id }, data });
      } catch {
        return reply.status(404).send({ error: "Truck not found" });
      }
    }
  );

  // Barista sub-resource
  fastify.post(
    "/baristas",
    { preHandler: [fastify.authenticate] },
    async (req) => {
      const data = baristaBody.parse(req.body);
      return fastify.prisma.barista.create({ data });
    }
  );

  fastify.delete<{ Params: { baristaId: string } }>(
    "/baristas/:baristaId",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      try {
        await fastify.prisma.barista.delete({ where: { id: req.params.baristaId } });
        return { ok: true };
      } catch {
        return reply.status(404).send({ error: "Barista not found" });
      }
    }
  );
};

export default trucksRoutes;
