use {
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_signer::Signer,
};

/// Smoke-test: verifies the program loads and the payer can be funded.
/// Full integration tests for initialize_collection / mint_nft require
/// Metaplex Token Metadata deployed locally — use Surfpool for those.
#[test]
fn cofacito_nft_loads() {
    let program_id = cofecito::id();
    let payer = Keypair::new();
    let mut svm = LiteSVM::new();
    let bytes = include_bytes!("../../../target/deploy/cofecito.so");
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    assert_eq!(svm.get_balance(&payer.pubkey()).unwrap(), 1_000_000_000);
}
