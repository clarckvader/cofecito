use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        mpl_token_metadata, mpl_token_metadata::types::DataV2,
        update_metadata_accounts_v2, Metadata, UpdateMetadataAccountsV2,
    },
    token::{Mint, Token, TokenAccount},
};

use crate::{error::CofacitoError, state::QrRecord};

#[derive(Accounts)]
pub struct UpdateBitacora<'info> {
    pub nft_mint: Account<'info, Mint>,

    // Proves the caller holds the NFT
    #[account(
        constraint = token_account.mint == nft_mint.key(),
        constraint = token_account.owner == owner.key(),
        constraint = token_account.amount == 1 @ CofacitoError::NotTokenOwner,
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub owner: Signer<'info>,

    // QrRecord caches the name so we can reconstruct DataV2 without extra params
    #[account(constraint = qr_record.mint == nft_mint.key())]
    pub qr_record: Account<'info, QrRecord>,

    /// CHECK: Metaplex metadata account for this NFT
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    // Backend keypair — is the update_authority set during mint_nft
    pub update_authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}

pub fn update_bitacora(ctx: Context<UpdateBitacora>, new_uri: String) -> Result<()> {
    require!(new_uri.len() <= crate::constants::MAX_URI_LEN, CofacitoError::UriTooLong);

    let name = ctx.accounts.qr_record.name.clone();

    // Update the NFT metadata URI with the completed bitacora IPFS CID
    update_metadata_accounts_v2(
        CpiContext::new(
            mpl_token_metadata::ID,
            UpdateMetadataAccountsV2 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                update_authority: ctx.accounts.update_authority.to_account_info(),
            },
        ),
        None, // keep existing update_authority
        Some(DataV2 {
            name,
            symbol: "CFT".to_string(),
            uri: new_uri.clone(),
            seller_fee_basis_points: 0,
            creators: None, // keep existing creators
            collection: None,
            uses: None,
        }),
        None, // keep primary_sale_happened
        None, // keep is_mutable
    )?;

    emit!(BitacoraUpdated {
        mint: ctx.accounts.nft_mint.key(),
        new_uri,
    });

    Ok(())
}

#[event]
pub struct BitacoraUpdated {
    pub mint: Pubkey,
    pub new_uri: String,
}
