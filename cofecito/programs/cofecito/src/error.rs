use anchor_lang::prelude::*;

#[error_code]
pub enum CofacitoError {
    #[msg("Only the authorized redeem controller can mint NFTs")]
    UnauthorizedMinter,
    #[msg("Caller does not hold the NFT token")]
    NotTokenOwner,
    #[msg("This QR code has already been redeemed")]
    QrAlreadyRedeemed,
    #[msg("URI exceeds maximum length of 200 characters")]
    UriTooLong,
    #[msg("Arithmetic overflow")]
    Overflow,
}
