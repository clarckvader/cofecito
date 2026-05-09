use anchor_lang::prelude::*;
use crate::state::RedeemState;

pub const REDEEM_STATE_SIZE: usize = 8 + 32 + 8 + 1; // disc + authority + total_redeemed + bump

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = REDEEM_STATE_SIZE,
        seeds = [b"redeem"],
        bump
    )]
    pub redeem_state: Account<'info, RedeemState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let state = &mut ctx.accounts.redeem_state;
    state.authority = ctx.accounts.authority.key();
    state.total_redeemed = 0;
    state.bump = ctx.bumps.redeem_state;

    msg!("QR Redeem program initialized. Authority: {}", ctx.accounts.authority.key());
    Ok(())
}
