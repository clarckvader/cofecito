import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { config } from "../config.js";

const sessionBody = z.object({
  walletAddress: z.string(),
  fiatAmount: z.number().optional(),
  fiatCurrency: z.string().default("USD"),
});

const rampRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/ramp/session — create Transak widget session
  fastify.post(
    "/session",
    { preHandler: [fastify.authenticate] },
    async (req) => {
      const { walletAddress, fiatAmount, fiatCurrency } = sessionBody.parse(req.body);

      // Transak hosted URL (no server-side session creation needed for basic integration)
      const params = new URLSearchParams({
        apiKey: config.TRANSAK_API_KEY ?? "",
        environment: config.TRANSAK_ENV === "production" ? "PRODUCTION" : "STAGING",
        walletAddress,
        network: "solana",
        cryptoCurrencyCode: "SOL",
        ...(fiatAmount ? { fiatAmount: fiatAmount.toString() } : {}),
        fiatCurrency,
        redirectURL: `${config.APP_URL}/ramp/complete`,
        themeColor: "C8961A",
      });

      const baseUrl =
        config.TRANSAK_ENV === "production"
          ? "https://global.transak.com"
          : "https://global-stg.transak.com";

      return { widgetUrl: `${baseUrl}?${params.toString()}` };
    }
  );
};

export default rampRoutes;
