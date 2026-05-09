pub const SEED_COLLECTION: &[u8] = b"collection";
pub const SEED_QR: &[u8] = b"qr";

pub const MAX_QR_CODE_LEN: usize = 32;   // "CFT-2026-001234"
pub const MAX_LOT_ID_LEN: usize = 64;    // "LOT-2026-001-FINCA-LOS-CEDROS"
pub const MAX_URI_LEN: usize = 200;
pub const MAX_NAME_LEN: usize = 60;      // "Cofecito #4721"

pub const COLLECTION_STATE_SIZE: usize = 8   // discriminator
    + 32                                      // authority
    + 32                                      // redeem_controller
    + 32                                      // collection_mint
    + 8                                       // total_supply
    + 1;                                      // bump

pub const QR_RECORD_SIZE: usize = 8     // discriminator
    + 4 + MAX_QR_CODE_LEN               // qr_code
    + 32                                // mint
    + 32                                // owner
    + 4 + MAX_LOT_ID_LEN               // lot_id
    + 4 + MAX_NAME_LEN                 // name (needed for update_bitacora)
    + 8                                // timestamp
    + 1;                               // bump
