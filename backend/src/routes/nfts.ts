import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAndUploadNftMetadata, uploadBuffer } from "../services/ipfs.service.js";
import { getConnection } from "../services/solana.service.js";
import { config } from "../config.js";

const bitacoraBody = z.object({
  fragrancia: z.number().int().min(1).max(5).optional(),
  aroma: z.number().int().min(1).max(5).optional(),
  sabor: z.number().int().min(1).max(5).optional(),
  saborResidual: z.number().int().min(1).max(5).optional(),
  balance: z.number().int().min(1).max(5).optional(),
  dulzor: z.number().int().min(1).max(5).optional(),
  tazaLimpia: z.number().int().min(1).max(5).optional(),
  acidez: z.number().int().min(1).max(5).optional(),
  cuerpo: z.number().int().min(1).max(5).optional(),
  preferencia: z.number().int().min(1).max(5).optional(),
  notasFrutado: z.boolean().optional(),
  notasChocolate: z.boolean().optional(),
  notasFloral: z.boolean().optional(),
  notasCitrico: z.boolean().optional(),
  notasNuez: z.boolean().optional(),
  notasCaramelo: z.boolean().optional(),
  notasBerries: z.boolean().optional(),
  notasHerbal: z.boolean().optional(),
  notasEspeciado: z.boolean().optional(),
  notasAhumado: z.boolean().optional(),
  notasLibres: z.string().nullish(),
  comentarios: z.string().nullish(),
});

function computeSca(fields: z.infer<typeof bitacoraBody>): number | undefined {
  const scores = [
    fields.fragrancia, fields.aroma, fields.sabor, fields.saborResidual,
    fields.balance, fields.dulzor, fields.tazaLimpia, fields.acidez,
    fields.cuerpo, fields.preferencia,
  ].filter((v): v is number => v !== undefined);

  if (scores.length === 0) return undefined;
  return scores.reduce((a, b) => a + b, 0);
}

const nftsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/nfts/user/:walletAddress — NFTs of a user via Helius DAS API
  fastify.get<{ Params: { walletAddress: string } }>(
    "/user/:walletAddress",
    async (req, reply) => {
      const { walletAddress } = req.params;
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${config.HELIUS_API_KEY}`;

      const res = await fetch(heliusUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "cofecito",
          method: "getAssetsByOwner",
          params: {
            ownerAddress: walletAddress,
            page: 1,
            limit: 100,
            displayOptions: { showCollectionMetadata: true },
          },
        }),
      });

      if (!res.ok) return reply.status(502).send({ error: "Helius API error" });
      const json = (await res.json()) as any;

      // Filter to Cofecito collection if collection mint is set
      const items = json.result?.items ?? [];
      const filtered = config.COLLECTION_MINT
        ? items.filter((i: any) => i.grouping?.some((g: any) => g.group_value === config.COLLECTION_MINT))
        : items;

      return { items: filtered, total: filtered.length };
    }
  );

  // GET /api/nfts/:mintAddress — single NFT metadata
  fastify.get<{ Params: { mintAddress: string } }>(
    "/:mintAddress",
    async (req, reply) => {
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${config.HELIUS_API_KEY}`;
      const res = await fetch(heliusUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "cofecito",
          method: "getAsset",
          params: { id: req.params.mintAddress },
        }),
      });

      if (!res.ok) return reply.status(502).send({ error: "Helius API error" });
      const json = (await res.json()) as any;
      if (!json.result) return reply.status(404).send({ error: "NFT not found" });
      return json.result;
    }
  );

  // POST /api/nfts/:mintAddress/bitacora — save sensory log
  fastify.post<{ Params: { mintAddress: string } }>(
    "/:mintAddress/bitacora",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { mintAddress } = req.params;
      const fields = bitacoraBody.parse(req.body);

      const cup = await fastify.prisma.cup.findFirst({
        where: { mintAddress },
        include: { lot: { include: { farm: true } }, truck: true, barista: true },
      });

      if (!cup) return reply.status(404).send({ error: "Cup not found for this mint" });

      const scoreSCA = computeSca(fields);

      const bitacora = await fastify.prisma.bitacora.upsert({
        where: { cupId: cup.id },
        create: {
          cupId: cup.id,
          mintAddress,
          ...fields,
          scoreSCA,
          completedAt: new Date(),
        },
        update: {
          ...fields,
          scoreSCA,
          completedAt: new Date(),
        },
      });

      // Build updated NFT metadata with bitacora fields and upload to IPFS (async)
      updateNftMetadata(fastify, cup, bitacora).catch((err) =>
        fastify.log.error({ err, mintAddress }, "Failed to update NFT metadata")
      );

      return bitacora;
    }
  );
};

async function updateNftMetadata(fastify: any, cup: any, bitacora: any) {
  const lot = cup.lot;
  const farm = lot.farm;

  const aromaNotas = [
    bitacora.notasFrutado && "Frutal",
    bitacora.notasChocolate && "Chocolate",
    bitacora.notasFloral && "Floral",
    bitacora.notasCitrico && "Cítrico",
    bitacora.notasNuez && "Nuez",
    bitacora.notasCaramelo && "Caramelo",
    bitacora.notasBerries && "Berries",
    bitacora.notasHerbal && "Herbal",
    bitacora.notasEspeciado && "Especiado",
    bitacora.notasAhumado && "Ahumado",
  ]
    .filter(Boolean)
    .join(", ");

  const meta = {
    name: `Cofecito — ${lot.variety}`,
    symbol: "CFT",
    description: `Bitácora sensorial de una taza de café ${lot.variety} de Finca ${farm.name}, Bolivia`,
    image: farm.photoIpfs ? `ipfs://${farm.photoIpfs}` : "",
    external_url: `https://cofecito.app/nft/${cup.mintAddress}`,
    attributes: [
      { trait_type: "Finca", value: farm.name },
      { trait_type: "Región", value: `${farm.region}, Bolivia` },
      { trait_type: "Altitud", value: `${farm.altitude} msnm` },
      { trait_type: "Productor", value: farm.producer },
      { trait_type: "Variedad", value: lot.variety },
      { trait_type: "Proceso", value: lot.process },
      { trait_type: "Nivel de Tueste", value: lot.roastLevel ?? "N/A" },
      { trait_type: "Método", value: cup.method },
      { trait_type: "Score SCA", value: bitacora.scoreSCA ?? 0 },
      { trait_type: "Notas Aromáticas", value: aromaNotas },
      { trait_type: "Notas del Usuario", value: bitacora.notasLibres ?? "" },
    ],
    properties: {
      category: "image",
      files: [],
      creators: [],
      lot_id: lot.id,
      qr_code: cup.qrCode,
      bitacora_audio: bitacora.audioIpfs ? `ipfs://${bitacora.audioIpfs}` : null,
      taza_photo: bitacora.photoIpfs ? `ipfs://${bitacora.photoIpfs}` : null,
    },
    collection: { name: "Cofecito Collection", family: "Cofecito" },
  };

  const { buildAndUploadNftMetadata } = await import("../services/ipfs.service.js");
  const metadataUri = await buildAndUploadNftMetadata(meta as any);

  await fastify.prisma.bitacora.update({
    where: { id: bitacora.id },
    data: { metadataIpfs: metadataUri },
  });

  // TODO: call cofecito::update_bitacora on-chain with new URI
  fastify.log.info({ mintAddress: cup.mintAddress, metadataUri }, "NFT metadata updated");
}

export default nftsRoutes;
