import { createRequire } from "module";
import { Readable } from "stream";
import { config } from "../config.js";

const _require = createRequire(import.meta.url);

type PinResponse = { IpfsHash: string };
type PinOpts = { pinataMetadata?: { name?: string }; pinataOptions?: { cidVersion?: number } };
type PinataClient = {
  pinJSONToIPFS(data: object, opts?: PinOpts): Promise<PinResponse>;
  pinFileToIPFS(stream: unknown, opts?: PinOpts): Promise<PinResponse>;
};

const PinataSdk: new (apiKey?: string, secret?: string) => PinataClient = _require("@pinata/sdk");

let _pinata: PinataClient | null = null;

function getPinata(): PinataClient {
  if (!_pinata) {
    _pinata = new PinataSdk(config.PINATA_API_KEY, config.PINATA_SECRET_KEY);
  }
  return _pinata;
}

export async function uploadJson(data: object, name: string): Promise<string> {
  const pinata = getPinata();
  const result = await pinata.pinJSONToIPFS(data, {
    pinataMetadata: { name },
  });
  return result.IpfsHash;
}

export async function uploadBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const pinata = getPinata();
  const stream = Readable.from(buffer);
  (stream as unknown as { path: string }).path = filename;
  const result = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name: filename },
    pinataOptions: { cidVersion: 1 },
  });
  return result.IpfsHash;
}

export function cidToUrl(cid: string): string {
  return `${config.PINATA_GATEWAY}${cid}`;
}

export type NftMetadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  properties: Record<string, unknown>;
  collection: { name: string; family: string };
};

export async function buildAndUploadNftMetadata(meta: NftMetadata): Promise<string> {
  const cid = await uploadJson(meta, `${meta.name}.json`);
  return `ipfs://${cid}`;
}
