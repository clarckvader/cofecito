use anchor_lang::prelude::*;

#[error_code]
pub enum TraceError {
    #[msg("Only the registry authority can register lots")]
    Unauthorized,
    #[msg("lot_id exceeds maximum length of 64 characters")]
    LotIdTooLong,
    #[msg("IPFS CID exceeds maximum length of 100 characters")]
    CidTooLong,
}
