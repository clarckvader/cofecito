use anchor_lang::prelude::*;

// PDA: [b"collection"] — singleton per deployment
// Holds the single Cofecito collection and controls who can mint.
#[account]
pub struct CollectionState {
    pub authority: Pubkey,          // Admin that initialized the collection
    pub redeem_controller: Pubkey,  // Only keypair allowed to call mint_nft (backend)
    pub collection_mint: Pubkey,    // The Metaplex Collection NFT mint
    pub total_supply: u64,          // Incremented on every mint
    pub bump: u8,
}

// PDA: [b"qr", qr_code.as_bytes()] — one per physical cup
// Acts as double-spend guard: if the PDA already exists, init fails.
#[account]
pub struct QrRecord {
    pub qr_code: String,    // e.g. "CFT-2026-001234"
    pub mint: Pubkey,       // Mint address of the NFT minted for this cup
    pub owner: Pubkey,      // Wallet that claimed the NFT
    pub lot_id: String,     // e.g. "LOT-2026-001"
    pub name: String,       // e.g. "Cofecito #4721" — cached for update_bitacora
    pub timestamp: i64,
    pub bump: u8,
}
