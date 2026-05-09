import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { generateQrCode, qrCodeToPng } from "../services/qr.service.js";
import { buildAndUploadNftMetadata } from "../services/ipfs.service.js";

const generateBody = z.object({
  lotId: z.string(),
  truckId: z.string(),
  baristaId: z.string(),
  method: z.enum(["Espresso", "V60", "Chemex", "AeroPress", "Moka", "ColdBrew", "Sifon"]),
  waterTemp: z.number().optional(),
  extractionTime: z.number().int().optional(),
  coffeeDose: z.number().optional(),
  waterRatio: z.number().optional(),
  baristaNotes: z.string().optional(),
});

const redeemBody = z.object({
  walletAddress: z.string(),
});

const cupsRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/cups/generate — barista creates a cup + QR
  fastify.post(
    "/generate",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const data = generateBody.parse(req.body);

      // Anti-double-generation: one active cup per barista per minute (Redis)
      const ratKey = `cup:rate:${data.baristaId}`;
      const recent = await fastify.redis.get(ratKey);
      if (recent) return reply.status(429).send({ error: "Too many cups generated, wait a moment" });
      await fastify.redis.set(ratKey, "1", "EX", 30);

      const qrCode = generateQrCode();
      const cup = await fastify.prisma.cup.create({
        data: { ...data, qrCode },
        include: { lot: { include: { farm: true } }, truck: true, barista: true },
      });

      const pngBuffer = await qrCodeToPng(qrCode);
      const qrImageBase64 = pngBuffer.toString("base64");

      return {
        qrCode,
        qrImageBase64,
        cup,
      };
    }
  );

  // GET /api/cups/:qrCode — consumer scans QR
  fastify.get<{ Params: { qrCode: string } }>("/:qrCode", async (req, reply) => {
    const cup = await fastify.prisma.cup.findUnique({
      where: { qrCode: req.params.qrCode },
      include: {
        lot: { include: { farm: true } },
        truck: true,
        barista: true,
        bitacora: true,
      },
    });
    if (!cup) return reply.status(404).send({ error: "QR not found" });
    return cup;
  });

  // POST /api/cups/:qrCode/redeem — consumer claims NFT
  fastify.post<{ Params: { qrCode: string } }>(
    "/:qrCode/redeem",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { walletAddress } = redeemBody.parse(req.body);

      const cup = await fastify.prisma.cup.findUnique({
        where: { qrCode: req.params.qrCode },
        include: { lot: { include: { farm: true } }, truck: true, barista: true },
      });

      if (!cup) return reply.status(404).send({ error: "QR not found" });
      if (cup.redeemed) return reply.status(409).send({ error: "QR already redeemed" });

      // Build NFT metadata and upload to IPFS
      const meta = buildNftMetadata(cup, walletAddress);
      const metadataUri = await buildAndUploadNftMetadata(meta);

      // Mark as redeemed (optimistic — before on-chain tx for responsiveness)
      const updated = await fastify.prisma.cup.update({
        where: { qrCode: cup.qrCode },
        data: { redeemed: true, redeemedAt: new Date(), walletAddress },
      });

      // TODO: invoke qr_redeem program on Solana to mint NFT
      // Stub returns metadata URI until Anchor IDL is available
      fastify.log.info({ qrCode: cup.qrCode, walletAddress, metadataUri }, "Cup redeemed");

      return { ok: true, cup: updated, metadataUri };
    }
  );
};

function buildNftMetadata(cup: any, walletAddress: string) {
  const lot = cup.lot;
  const farm = lot.farm;
  const supplyNumber = Math.floor(Math.random() * 99999) + 1; // replace with real counter from on-chain

  return {
    name: `Cofecito #${supplyNumber}`,
    symbol: "CFT",
    description: `Bitácora sensorial de una taza de café ${lot.variety} de Finca ${farm.name}, Bolivia`,
    image: farm.photoIpfs ? `ipfs://${farm.photoIpfs}` : "",
    external_url: `https://cofecito.app/nft/pending`,
    attributes: [
      { trait_type: "Finca", value: farm.name },
      { trait_type: "Región", value: `${farm.region}, Bolivia` },
      { trait_type: "Altitud", value: `${farm.altitude} msnm` },
      { trait_type: "Productor", value: farm.producer },
      { trait_type: "Variedad", value: lot.variety },
      { trait_type: "Proceso", value: lot.process },
      { trait_type: "Nivel de Tueste", value: lot.roastLevel ?? "N/A" },
      { trait_type: "Método", value: cup.method },
      { trait_type: "Temperatura", value: cup.waterTemp ? `${cup.waterTemp}°C` : "N/A" },
      { trait_type: "Dosis", value: cup.coffeeDose ? `${cup.coffeeDose}g` : "N/A" },
      { trait_type: "Ratio", value: cup.waterRatio ? `1:${cup.waterRatio}` : "N/A" },
      { trait_type: "Truck", value: cup.truck.name },
      { trait_type: "Barista", value: cup.barista.name },
      { trait_type: "Fecha", value: new Date().toISOString().split("T")[0] },
    ],
    properties: {
      category: "image",
      files: [],
      creators: [],
      lot_id: lot.id,
      qr_code: cup.qrCode,
    },
    collection: {
      name: "Cofecito Collection",
      family: "Cofecito",
    },
  };
}

export default cupsRoutes;
