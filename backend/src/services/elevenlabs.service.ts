import { ElevenLabsClient } from "elevenlabs";
import { config } from "../config.js";

let _client: ElevenLabsClient | null = null;

function getClient(): ElevenLabsClient {
  if (!_client) {
    _client = new ElevenLabsClient({ apiKey: config.ELEVENLABS_API_KEY });
  }
  return _client;
}

export type LotContext = {
  variety: string;
  farmName: string;
  region: string;
  process: string;
  altitude: number;
};

export async function createBitacoraSession(mintAddress: string, lot: LotContext) {
  const client = getClient();
  const session = await (client as any).conversationalAI.createSession({
    agentId: config.ELEVENLABS_AGENT_ID,
    overrides: {
      agent: {
        prompt: {
          prompt: `Eres el asistente de cata de Cofecito. El usuario acaba de tomar un café \
${lot.variety} de la finca ${lot.farmName} en ${lot.region}, Bolivia. \
Proceso: ${lot.process}. Altitud: ${lot.altitude}msnm. \
Guíalo amablemente por la bitácora sensorial. Sé cálido, curioso y educativo. \
Pregunta por: aromas, sabores, acidez, cuerpo, dulzor, experiencia general.`,
        },
      },
    },
  });
  return session;
}

export type BitacoraFields = {
  notasFrutado?: boolean;
  notasChocolate?: boolean;
  notasFloral?: boolean;
  notasCitrico?: boolean;
  notasNuez?: boolean;
  notasCaramelo?: boolean;
  notasBerries?: boolean;
  notasHerbal?: boolean;
  notasEspeciado?: boolean;
  notasAhumado?: boolean;
  notasLibres?: string;
};

const AROMA_KEYWORDS: Record<keyof Omit<BitacoraFields, "notasLibres">, string[]> = {
  notasFrutado: ["frutal", "fruta", "mango", "durazno", "maracuya"],
  notasChocolate: ["chocolate", "cacao", "cocoa"],
  notasFloral: ["floral", "jazmín", "jazmin", "rosa", "flor"],
  notasCitrico: ["cítrico", "citrico", "limón", "limon", "naranja", "mandarina"],
  notasNuez: ["nuez", "almendra", "avellana"],
  notasCaramelo: ["caramelo", "azúcar", "azucar", "miel"],
  notasBerries: ["berries", "fresa", "arándano", "arandano", "mora", "frambuesa"],
  notasHerbal: ["herbal", "hierba", "té", "te", "verde"],
  notasEspeciado: ["especiado", "canela", "clavo", "pimienta"],
  notasAhumado: ["ahumado", "humo", "madera", "roble"],
};

export async function transcribeAndParse(audioBuffer: Buffer): Promise<BitacoraFields> {
  const client = getClient();
  const stream = new Blob([new Uint8Array(audioBuffer)], { type: "audio/mpeg" });
  const result = await (client as any).speechToText.convert({
    audio: stream,
    model_id: "scribe_v1",
    language_code: "es",
  });

  const text: string = result.text?.toLowerCase() ?? "";
  const fields: BitacoraFields = { notasLibres: result.text };

  for (const [field, keywords] of Object.entries(AROMA_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      (fields as Record<string, unknown>)[field] = true;
    }
  }

  return fields;
}
