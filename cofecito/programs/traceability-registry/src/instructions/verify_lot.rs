use anchor_lang::prelude::*;
use crate::state::LotRecord;

#[derive(Accounts)]
pub struct VerifyLot<'info> {
    pub lot_record: Account<'info, LotRecord>,
}

/// Returns true if `data_hash` matches what was registered on-chain.
/// Clients call this via simulateTransaction to verify off-chain data integrity.
pub fn verify_lot(ctx: Context<VerifyLot>, data_hash: [u8; 32]) -> Result<bool> {
    let matches = ctx.accounts.lot_record.data_hash == data_hash;
    if matches {
        msg!("Hash verified: lot {} is authentic", ctx.accounts.lot_record.lot_id);
    } else {
        msg!("Hash mismatch: lot {} data may be tampered", ctx.accounts.lot_record.lot_id);
    }
    Ok(matches)
}
