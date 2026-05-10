import { FastifyPluginAsync } from "fastify";

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/overview", async () => {
    const [
      totalFarms,
      totalLots,
      totalTrucks,
      totalCups,
      redeemedCups,
      recentCups,
    ] = await Promise.all([
      fastify.prisma.farm.count(),
      fastify.prisma.lot.count(),
      fastify.prisma.truck.count(),
      fastify.prisma.cup.count(),
      fastify.prisma.cup.count({ where: { redeemed: true } }),
      fastify.prisma.cup.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          lot: { select: { name: true, variety: true } },
          truck: { select: { name: true } },
          barista: { select: { name: true } },
        },
      }),
    ]);

    // Cups per day for last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const cupsByDay = await fastify.prisma.cup.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: since } },
    });

    // Process distribution
    const processDist = await fastify.prisma.lot.groupBy({
      by: ["process"],
      _count: { id: true },
    });

    return {
      totalFarms,
      totalLots,
      totalTrucks,
      totalCups,
      redeemedCups,
      totalNFTs: redeemedCups,
      recentCups,
      processDist: processDist.map((p) => ({ process: p.process, count: p._count.id })),
    };
  });
};

export default analyticsRoutes;
