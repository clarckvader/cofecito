pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use state::*;

declare_id!("DkfahgAG9QdVYiDPeHaMgkoawPBjLh7sjeDVsN2p7Y3E");

#[program]
pub mod traceability_registry {
    use super::*;

    /// One-time setup: creates the registry with a designated authority.
    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        instructions::initialize_registry::initialize_registry(ctx)
    }

    /// Registers or updates the SHA-256 hash and IPFS CID of a coffee lot.
    /// Only the registry authority (backend) can call this.
    /// Using init_if_needed on the LotRecord allows updating if lot data changes.
    pub fn register_lot(
        ctx: Context<RegisterLot>,
        lot_id: String,
        data_hash: [u8; 32],
        ipfs_cid: String,
    ) -> Result<()> {
        instructions::register_lot::register_lot(ctx, lot_id, data_hash, ipfs_cid)
    }

    /// Checks whether the provided hash matches the on-chain record.
    /// Use simulateTransaction from the client to read the return value.
    pub fn verify_lot(ctx: Context<VerifyLot>, data_hash: [u8; 32]) -> Result<bool> {
        instructions::verify_lot::verify_lot(ctx, data_hash)
    }
}
