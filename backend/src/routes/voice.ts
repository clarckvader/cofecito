import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { createBitacoraSession, transcribeAndParse } from "../services/elevenlabs.service.js";

const sessionBody = z.object({
  mintAddress: z.string(),
});

const voiceRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/voice/token — returns a signed WebSocket URL (no auth required by caller)
  fastify.get("/token", async (_req, reply) => {
    // ElevenLabs WebSocket accepts authorization as a query param so the API key
    // never ships to the browser in source code.
    const signedUrl =
      `wss://api.elevenlabs.io/v1/convai/conversation` +
      `?agent_id=${encodeURIComponent(config.ELEVENLABS_AGENT_ID)}` +
      `&authorization=${encodeURIComponent(`Bearer ${config.ELEVENLABS_API_KEY}`)}`;
    return { signedUrl };
  });

  // POST /api/voice/session — create ElevenLabs conversational session
  fastify.post(
    "/session",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { mintAddress } = sessionBody.parse(req.body);

      const cup = await fastify.prisma.cup.findFirst({
        where: { mintAddress },
        include: { lot: { include: { farm: true } } },
      });

      if (!cup) return reply.status(404).send({ error: "Cup not found for this mint" });

      const lot = cup.lot;
      const farm = lot.farm;

      const session = await createBitacoraSession(mintAddress, {
        variety: lot.variety,
        farmName: farm.name,
        region: farm.region,
        process: lot.process,
        altitude: farm.altitude,
      });

      return session;
    }
  );

  // POST /api/voice/transcribe — receive audio buffer, return parsed bitácora fields
  fastify.post(
    "/transcribe",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const data = await req.file();
      if (!data) return reply.status(400).send({ error: "No audio file uploaded" });

      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);

      const fields = await transcribeAndParse(audioBuffer);
      return fields;
    }
  );
};

export default voiceRoutes;
