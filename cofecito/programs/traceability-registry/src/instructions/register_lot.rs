use anchor_lang::prelude::*;
use crate::{error::TraceError, state::{LotRecord, RegistryState}};

const MAX_LOT_ID: usize = 64;
const MAX_CID: usize = 100;

// disc + lot_id + data_hash + ipfs_cid + timestamp + registered_by + initialized + bump
pub const LOT_RECORD_SIZE: usize = 8
    + (4 + MAX_LOT_ID)
    + 32
    + (4 + MAX_CID)
    + 8
    + 32
    + 1
    + 1;

#[derive(Accounts)]
#[instruction(lot_id: String)]
pub struct RegisterLot<'info> {
    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry_state.bump,
        constraint = authority.key() == registry_state.authority @ TraceError::Unauthorized,
    )]
    pub registry_state: Account<'info, RegistryState>,

    #[account(
        init_if_needed,
        payer = authority,
        space = LOT_RECORD_SIZE,
        seeds = [b"lot", lot_id.as_bytes()],
        bump
    )]
    pub lot_record: Account<'info, LotRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn register_lot(
    ctx: Context<RegisterLot>,
    lot_id: String,
    data_hash: [u8; 32],
    ipfs_cid: String,
) -> Result<()> {
    require!(lot_id.len() <= MAX_LOT_ID, TraceError::LotIdTooLong);
    require!(ipfs_cid.len() <= MAX_CID, TraceError::CidTooLong);

    let record = &mut ctx.accounts.lot_record;
    let is_new = !record.initialized;

    record.lot_id = lot_id.clone();
    record.data_hash = data_hash;
    record.ipfs_cid = ipfs_cid.clone();
    record.timestamp = Clock::get()?.unix_timestamp;
    record.registered_by = ctx.accounts.authority.key();
    record.bump = ctx.bumps.lot_record;

    if is_new {
        record.initialized = true;
        ctx.accounts.registry_state.total_lots = ctx.accounts.registry_state.total_lots
            .checked_add(1)
            .ok_or(TraceError::Unauthorized)?; // reuse error for overflow (rare)
    }

    emit!(LotRegistered {
        lot_id,
        data_hash,
        ipfs_cid,
        timestamp: record.timestamp,
    });

    msg!("Lot registered: {}", record.lot_id);
    Ok(())
}

#[event]
pub struct LotRegistered {
    pub lot_id: String,
    pub data_hash: [u8; 32],
    pub ipfs_cid: String,
    pub timestamp: i64,
}
