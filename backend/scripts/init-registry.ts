/**
 * One-time script: initialize the Traceability Registry on-chain.
 *
 * Usage:
 *   cd backend
 *   npx tsx scripts/init-registry.ts
 */

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) throw new Error("SOLANA_RPC_URL not set in .env");

  const keypairRaw = JSON.parse(process.env.BACKEND_WALLET_KEYPAIR ?? "[]") as number[];
  if (keypairRaw.length !== 64) throw new Error("BACKEND_WALLET_KEYPAIR invalid (need 64-byte array)");

  const programId = process.env.TRACEABILITY_REGISTRY_PROGRAM_ID;
  if (!programId) throw new Error("TRACEABILITY_REGISTRY_PROGRAM_ID not set in .env");

  const authority = Keypair.fromSecretKey(Uint8Array.from(keypairRaw));

  console.log("Authority:", authority.publicKey.toBase58());
  console.log("RPC:      ", rpcUrl);
  console.log("Program:  ", programId);
  console.log();

  const connection = new Connection(rpcUrl, "confirmed");
  const provider = new AnchorProvider(connection, new Wallet(authority), { commitment: "confirmed" });

  const idlPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../cofecito/target/idl/traceability_registry.json"
  );
  const idl = JSON.parse(readFileSync(idlPath, "utf8"));
  const program = new Program(idl, provider);

  const [registryState] = PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    new PublicKey(programId)
  );
  console.log("registry_state PDA:", registryState.toBase58());

  const existing = await connection.getAccountInfo(registryState);
  if (existing) {
    console.log("registry_state already initialized — nothing to do.");
    return;
  }

  console.log("Sending transaction...");
  try {
    const tx = await (program.methods as any)
      .initializeRegistry()
      .accounts({
        registryState,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Transaction signature:", tx);
    console.log();
    console.log("=".repeat(60));
    console.log("SUCCESS — Traceability Registry initialized.");
    console.log("Authority:", authority.publicKey.toBase58());
    console.log("=".repeat(60));
  } catch (err: any) {
    console.error("Transaction failed:", err?.message ?? err);
    if (err?.logs) console.error("Program logs:\n", err.logs.join("\n"));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
