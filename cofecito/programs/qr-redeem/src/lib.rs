pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use state::*;

declare_id!("8Va7rSi8sCXgFzgDgLAy9UkrhHkH1NtKW286zPDDaA6f");

#[program]
pub mod qr_redeem {
    use super::*;

    /// One-time setup for the QR Redeem program.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::initialize(ctx)
    }

    /// Validates the QR redemption request and CPIs into cofacito_nft to mint the NFT.
    /// Double-spend protection is enforced by cofacito_nft via the QrRecord PDA.
    pub fn redeem(
        ctx: Context<Redeem>,
        qr_code: String,
        lot_id: String,
        metadata_uri: String,
        name: String,
    ) -> Result<()> {
        instructions::redeem::redeem(ctx, qr_code, lot_id, metadata_uri, name)
    }
}
