use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata,
        mpl_token_metadata::types::{Collection, Creator, DataV2},
        set_and_verify_sized_collection_item, CreateMasterEditionV3,
        CreateMetadataAccountsV3, Metadata, SetAndVerifySizedCollectionItem,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::*,
    error::CofacitoError,
    state::{CollectionState, QrRecord},
};

#[derive(Accounts)]
#[instruction(qr_code: String)]
pub struct MintNft<'info> {
    #[account(
        mut,
        seeds = [SEED_COLLECTION],
        bump = collection_state.bump,
    )]
    pub collection_state: Account<'info, CollectionState>,

    // QR PDA — uniqueness = double-spend prevention.
    // If this QR was already redeemed, `init` fails with "already in use".
    #[account(
        init,
        payer = payer,
        space = QR_RECORD_SIZE,
        seeds = [SEED_QR, qr_code.as_bytes()],
        bump
    )]
    pub qr_record: Account<'info, QrRecord>,

    // Fresh mint for this cup's NFT
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = redeem_authority,
        mint::freeze_authority = redeem_authority,
    )]
    pub nft_mint: Account<'info, Mint>,

    /// CHECK: destination wallet — validated only that it's a valid pubkey
    pub user: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = nft_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    // Must match collection_state.redeem_controller
    #[account(
        constraint = redeem_authority.key() == collection_state.redeem_controller
            @ CofacitoError::UnauthorizedMinter
    )]
    pub redeem_authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // Collection accounts for set_and_verify
    #[account(constraint = collection_mint.key() == collection_state.collection_mint)]
    pub collection_mint: Account<'info, Mint>,

    /// CHECK: Metaplex metadata PDA for the collection NFT
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA for the collection NFT
    #[account(mut)]
    pub collection_master_edition: UncheckedAccount<'info>,

    /// CHECK: Metaplex metadata PDA for the new NFT — initialized by CPI
    #[account(mut)]
    pub nft_metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA for the new NFT — initialized by CPI
    #[account(mut)]
    pub nft_master_edition: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn mint_nft(
    ctx: Context<MintNft>,
    qr_code: String,
    lot_id: String,
    metadata_uri: String,
    name: String,
) -> Result<()> {
    require!(metadata_uri.len() <= MAX_URI_LEN, CofacitoError::UriTooLong);

    let supply_number = ctx.accounts.collection_state.total_supply
        .checked_add(1)
        .ok_or(CofacitoError::Overflow)?;

    ctx.accounts.collection_state.total_supply = supply_number;

    // Record QR → NFT mapping
    let qr_record = &mut ctx.accounts.qr_record;
    qr_record.qr_code = qr_code.clone();
    qr_record.mint = ctx.accounts.nft_mint.key();
    qr_record.owner = ctx.accounts.user.key();
    qr_record.lot_id = lot_id;
    qr_record.name = name.clone();
    qr_record.timestamp = Clock::get()?.unix_timestamp;
    qr_record.bump = ctx.bumps.qr_record;

    // collection_state PDA seeds for signing as collection authority
    let collection_bump = ctx.accounts.collection_state.bump;
    let collection_seeds: &[&[u8]] = &[SEED_COLLECTION, &[collection_bump]];

    // 1. Mint 1 token to user
    mint_to(
        CpiContext::new(
            anchor_spl::token::ID,
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.redeem_authority.to_account_info(),
            },
        ),
        1,
    )?;

    // 2. Create Metaplex metadata for the NFT
    create_metadata_accounts_v3(
        CpiContext::new(
            mpl_token_metadata::ID,
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.nft_metadata.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                mint_authority: ctx.accounts.redeem_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.redeem_authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        DataV2 {
            name: name.clone(),
            symbol: "CFT".to_string(),
            uri: metadata_uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator {
                address: ctx.accounts.redeem_authority.key(),
                verified: true,
                share: 100,
            }]),
            collection: Some(Collection {
                verified: false, // verified in step 4
                key: ctx.accounts.collection_state.collection_mint,
            }),
            uses: None,
        },
        true, // is_mutable — URI will be updated after bitacora
        true, // update_authority_is_signer
        None, // not a collection itself
    )?;

    // 3. Create master edition (supply = 1 → unique NFT)
    create_master_edition_v3(
        CpiContext::new(
            mpl_token_metadata::ID,
            CreateMasterEditionV3 {
                edition: ctx.accounts.nft_master_edition.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                update_authority: ctx.accounts.redeem_authority.to_account_info(),
                mint_authority: ctx.accounts.redeem_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                metadata: ctx.accounts.nft_metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        Some(1),
    )?;

    // 4. Verify the NFT as a member of the Cofecito collection.
    //    collection_state PDA signs as collection authority via its seeds.
    set_and_verify_sized_collection_item(
        CpiContext::new_with_signer(
            mpl_token_metadata::ID,
            SetAndVerifySizedCollectionItem {
                metadata: ctx.accounts.nft_metadata.to_account_info(),
                collection_authority: ctx.accounts.collection_state.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.redeem_authority.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx.accounts.collection_master_edition.to_account_info(),
            },
            &[collection_seeds],
        ),
        None,
    )?;

    emit!(NftMinted {
        mint: ctx.accounts.nft_mint.key(),
        owner: ctx.accounts.user.key(),
        qr_code,
        collection: ctx.accounts.collection_state.collection_mint,
        supply_number,
    });

    msg!("NFT minted: {} for QR #{}", name, supply_number);
    Ok(())
}

#[event]
pub struct NftMinted {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub qr_code: String,
    pub collection: Pubkey,
    pub supply_number: u64,
}
