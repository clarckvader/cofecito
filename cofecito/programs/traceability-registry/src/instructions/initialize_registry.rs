use anchor_lang::prelude::*;
use crate::state::RegistryState;

pub const REGISTRY_STATE_SIZE: usize = 8 + 32 + 8 + 1; // disc + authority + total_lots + bump

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = REGISTRY_STATE_SIZE,
        seeds = [b"registry"],
        bump
    )]
    pub registry_state: Account<'info, RegistryState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
    let registry = &mut ctx.accounts.registry_state;
    registry.authority = ctx.accounts.authority.key();
    registry.total_lots = 0;
    registry.bump = ctx.bumps.registry_state;

    msg!("Traceability registry initialized. Authority: {}", ctx.accounts.authority.key());
    Ok(())
}
