import PinataClient from "@pinata/sdk";
import { Readable } from "stream";
import { config } from "../config.js";

let _pinata: PinataClient | null = null;

function getPinata(): PinataClient {
  if (!_pinata) {
    _pinata = new PinataClient(config.PINATA_API_KEY, config.PINATA_SECRET_KEY);
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
  filename: string,
  contentType: string
): Promise<string> {
  const pinata = getPinata();
  const stream = Readable.from(buffer);
  (stream as NodeJS.ReadableStream & { path: string }).path = filename;
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
