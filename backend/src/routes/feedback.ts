import { FastifyPluginAsync } from "fastify";

const feedbackRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/feedback/farm/:farmId — aggregated feedback for a farm
  fastify.get<{ Params: { farmId: string } }>("/farm/:farmId", async (req, reply) => {
    const farm = await fastify.prisma.farm.findUnique({ where: { id: req.params.farmId } });
    if (!farm) return reply.status(404).send({ error: "Farm not found" });

    const bitacoras = await fastify.prisma.bitacora.findMany({
      where: { cup: { lot: { farmId: req.params.farmId } } },
      include: { cup: { include: { lot: { select: { id: true, name: true, variety: true } } } } },
    });

    return aggregateBitacoras(bitacoras);
  });

  // GET /api/feedback/lot/:lotId — feedback for a specific lot
  fastify.get<{ Params: { lotId: string } }>("/lot/:lotId", async (req, reply) => {
    const lot = await fastify.prisma.lot.findUnique({ where: { id: req.params.lotId } });
    if (!lot) return reply.status(404).send({ error: "Lot not found" });

    const bitacoras = await fastify.prisma.bitacora.findMany({
      where: { cup: { lotId: req.params.lotId } },
    });

    return aggregateBitacoras(bitacoras);
  });
};

function aggregateBitacoras(bitacoras: any[]) {
  if (bitacoras.length === 0) return { totalCups: 0, avgScoreSCA: null, aromaProfile: {}, topNotas: [] };

  const scores = bitacoras.map((b) => b.scoreSCA).filter((s) => s !== null) as number[];
  const avgScoreSCA = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const aromaKeys = [
    "notasFrutado", "notasChocolate", "notasFloral", "notasCitrico",
    "notasNuez", "notasCaramelo", "notasBerries", "notasHerbal",
    "notasEspeciado", "notasAhumado",
  ] as const;

  const aromaProfile: Record<string, number> = {};
  for (const key of aromaKeys) {
    const count = bitacoras.filter((b) => b[key]).length;
    aromaProfile[key] = count;
  }

  const topNotas = Object.entries(aromaProfile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, count]) => ({ key, count }));

  const sensoryFields = ["fragrancia", "aroma", "sabor", "saborResidual", "balance",
    "dulzor", "tazaLimpia", "acidez", "cuerpo", "preferencia"] as const;

  const avgSensory: Record<string, number | null> = {};
  for (const field of sensoryFields) {
    const vals = bitacoras.map((b) => b[field]).filter((v) => v !== null) as number[];
    avgSensory[field] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  return {
    totalCups: bitacoras.length,
    avgScoreSCA: avgScoreSCA ? Math.round(avgScoreSCA * 10) / 10 : null,
    aromaProfile,
    topNotas,
    avgSensory,
  };
}

export default feedbackRoutes;
