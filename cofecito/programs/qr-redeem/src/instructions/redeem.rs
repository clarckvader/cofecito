use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::Metadata,
    token::{Mint, Token, TokenAccount},
};
use cofecito::cpi::accounts::MintNft;

use crate::state::RedeemState;

#[derive(Accounts)]
#[instruction(qr_code: String)]
pub struct Redeem<'info> {
    #[account(
        mut,
        seeds = [b"redeem"],
        bump = redeem_state.bump,
    )]
    pub redeem_state: Account<'info, RedeemState>,

    // ── Accounts forwarded to cofacito_nft::mint_nft via CPI ──────────────────

    /// CHECK: CollectionState PDA in cofacito_nft — validated by that program
    #[account(mut)]
    pub collection_state: UncheckedAccount<'info>,

    /// CHECK: QrRecord PDA [b"qr", qr_code] — init'd in CPI, guarantees uniqueness
    #[account(mut)]
    pub qr_record: UncheckedAccount<'info>,

    /// CHECK: Fresh mint keypair for the NFT — must be provided as Signer
    #[account(mut)]
    pub nft_mint: Signer<'info>,

    /// CHECK: Destination wallet
    pub user: UncheckedAccount<'info>,

    /// CHECK: User's ATA — created in CPI
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,

    // Backend keypair — must match collection_state.redeem_controller
    pub redeem_authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: collection_mint stored in CollectionState
    pub collection_mint: UncheckedAccount<'info>,

    /// CHECK: Metaplex metadata PDA for collection NFT
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA for collection NFT
    #[account(mut)]
    pub collection_master_edition: UncheckedAccount<'info>,

    /// CHECK: Metaplex metadata PDA for the new NFT — init'd by CPI
    #[account(mut)]
    pub nft_metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA for the new NFT — init'd by CPI
    #[account(mut)]
    pub nft_master_edition: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn redeem(
    ctx: Context<Redeem>,
    qr_code: String,
    lot_id: String,
    metadata_uri: String,
    name: String,
) -> Result<()> {
    // CPI to cofacito_nft::mint_nft
    // The QrRecord PDA [b"qr", qr_code] inside cofacito_nft ensures idempotency:
    // if this QR was already redeemed, the init will fail with "already in use".
    cofecito::cpi::mint_nft(
        CpiContext::new(
            cofecito::ID,
            MintNft {
                collection_state: ctx.accounts.collection_state.to_account_info(),
                qr_record: ctx.accounts.qr_record.to_account_info(),
                nft_mint: ctx.accounts.nft_mint.to_account_info(),
                user: ctx.accounts.user.to_account_info(),
                user_token_account: ctx.accounts.user_token_account.to_account_info(),
                redeem_authority: ctx.accounts.redeem_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx.accounts.collection_master_edition.to_account_info(),
                nft_metadata: ctx.accounts.nft_metadata.to_account_info(),
                nft_master_edition: ctx.accounts.nft_master_edition.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
                metadata_program: ctx.accounts.metadata_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        qr_code.clone(),
        lot_id,
        metadata_uri,
        name,
    )?;

    ctx.accounts.redeem_state.total_redeemed = ctx.accounts.redeem_state.total_redeemed
        .checked_add(1)
        .unwrap_or(u64::MAX);

    emit!(QrRedeemed {
        qr_code,
        user: ctx.accounts.user.key(),
        mint: ctx.accounts.nft_mint.key(),
    });

    Ok(())
}

#[event]
pub struct QrRedeemed {
    pub qr_code: String,
    pub user: Pubkey,
    pub mint: Pubkey,
}
