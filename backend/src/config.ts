import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  JWT_SECRET: z.string(),
  BACKEND_WALLET_KEYPAIR: z.string(),

  SOLANA_RPC_URL: z.string(),
  HELIUS_API_KEY: z.string(),
  SOLANA_CLUSTER: z.enum(["mainnet-beta", "devnet", "localnet"]).default("devnet"),

  COFACITO_NFT_PROGRAM_ID: z.string(),
  TRACEABILITY_REGISTRY_PROGRAM_ID: z.string(),
  QR_REDEEM_PROGRAM_ID: z.string(),
  COLLECTION_MINT: z.string().optional(),

  PINATA_API_KEY: z.string(),
  PINATA_SECRET_KEY: z.string(),
  PINATA_GATEWAY: z.string().default("https://gateway.pinata.cloud/ipfs/"),

  ELEVENLABS_API_KEY: z.string(),
  ELEVENLABS_AGENT_ID: z.string(),
  ELEVENLABS_VOICE_ID: z.string(),

  TRANSAK_API_KEY: z.string().optional(),
  TRANSAK_ENV: z.enum(["staging", "production"]).default("staging"),

  PORT: z.coerce.number().default(3001),
  APP_URL: z.string().default("http://localhost:3000"),
  API_URL: z.string().default("http://localhost:3001"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
