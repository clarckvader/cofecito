use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata,
        mpl_token_metadata::types::{CollectionDetails, Creator, DataV2},
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::*,
    state::CollectionState,
};

#[derive(Accounts)]
pub struct InitializeCollection<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    // redeem_controller is stored but doesn't sign here; it's set once at init.
    /// CHECK: stored as the authorized minter pubkey, no on-chain validation needed at init
    pub redeem_controller: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = COLLECTION_STATE_SIZE,
        seeds = [SEED_COLLECTION],
        bump
    )]
    pub collection_state: Account<'info, CollectionState>,

    // The Metaplex Collection NFT mint
    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = authority,
        mint::freeze_authority = authority,
    )]
    pub collection_mint: Account<'info, Mint>,

    /// CHECK: initialized by Metaplex CPI
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: initialized by Metaplex CPI
    #[account(mut)]
    pub collection_master_edition: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = collection_mint,
        associated_token::authority = authority,
    )]
    pub collection_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_collection(
    ctx: Context<InitializeCollection>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let bump = ctx.bumps.collection_state;

    let collection_state = &mut ctx.accounts.collection_state;
    collection_state.authority = ctx.accounts.authority.key();
    collection_state.redeem_controller = ctx.accounts.redeem_controller.key();
    collection_state.collection_mint = ctx.accounts.collection_mint.key();
    collection_state.total_supply = 0;
    collection_state.bump = bump;

    // Seeds for the collection_state PDA to sign as update_authority
    let collection_seeds: &[&[u8]] = &[SEED_COLLECTION, &[bump]];

    // 1. Mint 1 token to authority ATA
    mint_to(
        CpiContext::new(
            anchor_spl::token::ID,
            MintTo {
                mint: ctx.accounts.collection_mint.to_account_info(),
                to: ctx.accounts.collection_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        1,
    )?;

    // 2. Create Metaplex metadata
    //    update_authority = collection_state PDA so the program can verify members.
    //    update_authority_is_signer = false here; PDA signs via invoke_signed below.
    create_metadata_accounts_v3(
        CpiContext::new(
            mpl_token_metadata::ID,
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.collection_metadata.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                update_authority: ctx.accounts.collection_state.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator {
                address: ctx.accounts.authority.key(),
                verified: false,
                share: 100,
            }]),
            collection: None,
            uses: None,
        },
        true,  // is_mutable
        false, // update_authority_is_signer — PDA signs via seeds below
        Some(CollectionDetails::V1 { size: 0 }),
    )?;

    // 3. Create master edition — collection_state PDA signs as update_authority
    create_master_edition_v3(
        CpiContext::new_with_signer(
            mpl_token_metadata::ID,
            CreateMasterEditionV3 {
                edition: ctx.accounts.collection_master_edition.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                update_authority: ctx.accounts.collection_state.to_account_info(),
                mint_authority: ctx.accounts.authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                metadata: ctx.accounts.collection_metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &[collection_seeds],
        ),
        Some(0), // max_supply = 0 → non-printable collection NFT
    )?;

    msg!(
        "Cofecito collection initialized. Mint: {}. Redeem controller: {}",
        ctx.accounts.collection_mint.key(),
        ctx.accounts.redeem_controller.key(),
    );
    Ok(())
}
