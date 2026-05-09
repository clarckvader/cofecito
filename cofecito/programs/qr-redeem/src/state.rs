use anchor_lang::prelude::*;

// PDA: [b"redeem"] — singleton
#[account]
pub struct RedeemState {
    pub authority: Pubkey,   // Admin that initialized this program
    pub total_redeemed: u64, // Lifetime redemption counter
    pub bump: u8,
}
