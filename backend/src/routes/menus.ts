import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const menuItemBody = z.object({
  truckId: z.string(),
  lotId: z.string(),
  price: z.number().positive(),
});

const menusRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: { truckId: string } }>(
    "/truck/:truckId",
    async (req, reply) => {
      const items = await fastify.prisma.menuItem.findMany({
        where: { truckId: req.params.truckId, active: true },
        include: {
          lot: {
            include: { farm: true },
          },
        },
      });
      return items;
    }
  );

  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (req) => {
      const data = menuItemBody.parse(req.body);
      return fastify.prisma.menuItem.create({
        data,
        include: { lot: true, truck: true },
      });
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { active: boolean } }>(
    "/:id/active",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      try {
        return await fastify.prisma.menuItem.update({
          where: { id: req.params.id },
          data: { active: req.body.active },
        });
      } catch {
        return reply.status(404).send({ error: "MenuItem not found" });
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      try {
        await fastify.prisma.menuItem.delete({ where: { id: req.params.id } });
        return { ok: true };
      } catch {
        return reply.status(404).send({ error: "MenuItem not found" });
      }
    }
  );
};

export default menusRoutes;
