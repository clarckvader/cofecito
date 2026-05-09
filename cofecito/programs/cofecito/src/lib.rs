pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("75upmoX4dfTqkRhhbbz2qfui8yxuVYzcyQgwEnhA8Vs2");

#[program]
pub mod cofacito_nft {
    use super::*;

    /// One-time setup: creates the global Cofecito collection NFT.
    /// Sets the redeem_controller — the only keypair allowed to call mint_nft.
    pub fn initialize_collection(
        ctx: Context<InitializeCollection>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::initialize_collection::initialize_collection(ctx, name, symbol, uri)
    }

    /// Mints a unique NFT for a redeemed cup.
    /// Only callable by the authorized redeem_controller (backend keypair).
    /// The QrRecord PDA [b"qr", qr_code] guarantees each QR can only be redeemed once.
    pub fn mint_nft(
        ctx: Context<MintNft>,
        qr_code: String,
        lot_id: String,
        metadata_uri: String,
        name: String,
    ) -> Result<()> {
        instructions::mint_nft::mint_nft(ctx, qr_code, lot_id, metadata_uri, name)
    }

    /// Updates the NFT metadata URI after the user completes the bitácora sensorial.
    /// Requires both the NFT owner and the update_authority (backend) to sign.
    pub fn update_bitacora(ctx: Context<UpdateBitacora>, new_uri: String) -> Result<()> {
        instructions::update_bitacora::update_bitacora(ctx, new_uri)
    }
}
