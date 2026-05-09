/**
 * One-time script: initialize the Cofecito Collection NFT on-chain.
 *
 * Usage:
 *   cd backend
 *   npx tsx scripts/init-collection.ts
 *
 * After it runs, copy the printed COLLECTION_MINT into your .env file.
 */

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env") });

// ── Constants ──────────────────────────────────────────────────────────────

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// ── Helpers ────────────────────────────────────────────────────────────────

function findMetadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  )[0];
}

function findMasterEditionPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  )[0];
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) throw new Error("SOLANA_RPC_URL not set in .env");

  const keypairRaw = JSON.parse(process.env.BACKEND_WALLET_KEYPAIR ?? "[]") as number[];
  if (keypairRaw.length !== 64) throw new Error("BACKEND_WALLET_KEYPAIR invalid (need 64-byte array)");

  const programId = process.env.COFACITO_NFT_PROGRAM_ID;
  if (!programId) throw new Error("COFACITO_NFT_PROGRAM_ID not set in .env");

  const authority = Keypair.fromSecretKey(Uint8Array.from(keypairRaw));
  // The redeem controller is the same backend wallet for MVP.
  // Use a separate keypair in production if needed.
  const redeemController = authority.publicKey;

  console.log("Authority:         ", authority.publicKey.toBase58());
  console.log("Redeem controller: ", redeemController.toBase58());
  console.log("RPC:               ", rpcUrl);
  console.log("Program:           ", programId);
  console.log();

  const connection = new Connection(rpcUrl, "confirmed");
  const wallet = new Wallet(authority);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

  // Load IDL from compiled Anchor output
  const idlPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../cofecito/target/idl/cofacito_nft.json"
  );
  const idl = JSON.parse(readFileSync(idlPath, "utf8"));
  const program = new Program(idl, provider);

  // New keypair for the collection mint (generated fresh every time you run this)
  const collectionMint = Keypair.generate();
  console.log("Collection mint:   ", collectionMint.publicKey.toBase58());

  // Derived accounts
  const [collectionState] = PublicKey.findProgramAddressSync(
    [Buffer.from("collection")],
    new PublicKey(programId)
  );
  const collectionMetadata = findMetadataPda(collectionMint.publicKey);
  const collectionMasterEdition = findMasterEditionPda(collectionMint.publicKey);
  const collectionTokenAccount = getAssociatedTokenAddressSync(
    collectionMint.publicKey,
    authority.publicKey
  );

  console.log("collection_state:         ", collectionState.toBase58());
  console.log("collection_metadata:      ", collectionMetadata.toBase58());
  console.log("collection_master_edition:", collectionMasterEdition.toBase58());
  console.log("collection_token_account: ", collectionTokenAccount.toBase58());
  console.log();

  // Simulate first to catch issues before paying fees
  console.log("Simulating transaction...");
  try {
    await (program.methods as any)
      .initializeCollection(
        "Cofecito Collection",
        "CFT",
        "https://cofecito.app/collection-metadata.json"
      )
      .accounts({
        authority: authority.publicKey,
        redeemController,
        collectionState,
        collectionMint: collectionMint.publicKey,
        collectionMetadata,
        collectionMasterEdition,
        collectionTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([collectionMint])
      .simulate();
    console.log("Simulation OK.\n");
  } catch (err: any) {
    console.error("Simulation failed:", err?.message ?? err);
    console.error("Fix the error above before sending.\n");
    process.exit(1);
  }

  // Send transaction
  console.log("Sending transaction...");
  const tx = await (program.methods as any)
    .initializeCollection(
      "Cofecito Collection",
      "CFT",
      "https://cofecito.app/collection-metadata.json"
    )
    .accounts({
      authority: authority.publicKey,
      redeemController,
      collectionState,
      collectionMint: collectionMint.publicKey,
      collectionMetadata,
      collectionMasterEdition,
      collectionTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([collectionMint])
    .rpc();

  console.log("Transaction signature:", tx);
  console.log();
  console.log("=".repeat(60));
  console.log("SUCCESS — add this to your .env:");
  console.log(`COLLECTION_MINT="${collectionMint.publicKey.toBase58()}"`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
