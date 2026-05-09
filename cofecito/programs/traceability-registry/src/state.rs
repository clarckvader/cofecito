use anchor_lang::prelude::*;

// PDA: [b"registry"] — singleton
#[account]
pub struct RegistryState {
    pub authority: Pubkey, // Only this keypair can register/update lots
    pub total_lots: u64,
    pub bump: u8,
}

// PDA: [b"lot", lot_id.as_bytes()]
// Stores the SHA-256 hash of the lot's full JSON data.
// Anyone can verify off-chain data integrity by hashing and comparing.
#[account]
pub struct LotRecord {
    pub lot_id: String,        // e.g. "LOT-2026-001"
    pub data_hash: [u8; 32],   // SHA-256 of the lot JSON stored in IPFS
    pub ipfs_cid: String,      // IPFS CID where the full lot JSON lives
    pub timestamp: i64,
    pub registered_by: Pubkey,
    pub initialized: bool,     // false until first register_lot call
    pub bump: u8,
}
