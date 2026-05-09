import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, web3 } from "@coral-xyz/anchor";
import { config } from "../config.js";

let _connection: Connection | null = null;
let _wallet: Keypair | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(config.SOLANA_RPC_URL, "confirmed");
  }
  return _connection;
}

export function getBackendKeypair(): Keypair {
  if (!_wallet) {
    const raw = JSON.parse(config.BACKEND_WALLET_KEYPAIR) as number[];
    _wallet = Keypair.fromSecretKey(Uint8Array.from(raw));
  }
  return _wallet;
}

export function getProvider(): AnchorProvider {
  const connection = getConnection();
  const keypair = getBackendKeypair();
  const wallet = new Wallet(keypair);
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

export async function sendTx(tx: Transaction): Promise<string> {
  const connection = getConnection();
  const keypair = getBackendKeypair();
  return sendAndConfirmTransaction(connection, tx, [keypair]);
}

export function toPubkey(address: string): PublicKey {
  return new PublicKey(address);
}

export const COFACITO_NFT_PROGRAM_ID = new PublicKey(config.COFACITO_NFT_PROGRAM_ID);
export const TRACEABILITY_REGISTRY_PROGRAM_ID = new PublicKey(config.TRACEABILITY_REGISTRY_PROGRAM_ID);
export const QR_REDEEM_PROGRAM_ID = new PublicKey(config.QR_REDEEM_PROGRAM_ID);
