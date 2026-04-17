#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

// ─── Helpers ────────────────────────────────────────────────────────────────

fn setup() -> (Env, VeracityLinkClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(VeracityLink, ());
    let client = VeracityLinkClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, client, admin)
}

fn make_hash(env: &Env, seed: u8) -> BytesN<32> {
    BytesN::from_array(env, &[seed; 32])
}

// ─── Test 1: Happy path – issue one credential and verify it ─────────────────
#[test]
fn test_issue_and_verify_single_credential() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);
    let hash = make_hash(&env, 1);

    client.issue_credential(&student, &hash);

    assert!(client.verify_credential(&student, &hash));
}

// ─── Test 2: Multiple credentials can be issued to the same student ──────────
#[test]
fn test_multiple_credentials_issuance() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);
    let hash_bs = make_hash(&env, 1);
    let hash_ms = make_hash(&env, 2);

    client.issue_credential(&student, &hash_bs);
    client.issue_credential(&student, &hash_ms);

    assert!(client.verify_credential(&student, &hash_bs));
    assert!(client.verify_credential(&student, &hash_ms));
}

// ─── Test 3: Revoking a credential makes verification return false ────────────
#[test]
fn test_credential_revocation() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);
    let hash = make_hash(&env, 9);

    client.issue_credential(&student, &hash);
    assert!(client.verify_credential(&student, &hash));

    client.revoke_credential(&student, &hash);
    assert!(!client.verify_credential(&student, &hash));
}

// ─── Test 4: Revoking one credential does not affect others ─────────────────
#[test]
fn test_revoke_one_credential_leaves_others_intact() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);
    let hash_a = make_hash(&env, 10);
    let hash_b = make_hash(&env, 20);

    client.issue_credential(&student, &hash_a);
    client.issue_credential(&student, &hash_b);
    client.revoke_credential(&student, &hash_a);

    assert!(!client.verify_credential(&student, &hash_a));
    assert!(client.verify_credential(&student, &hash_b));
}

// ─── Test 5: Unknown hash returns false (no record exists) ───────────────────
#[test]
fn test_verify_unknown_hash_returns_false() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);
    let unknown = make_hash(&env, 99);

    assert!(!client.verify_credential(&student, &unknown));
}

// ─── Test 6: Credentials are isolated between different students ─────────────
#[test]
fn test_credentials_are_per_student() {
    let (env, client, _) = setup();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let hash = make_hash(&env, 5);

    client.issue_credential(&alice, &hash);

    // Hash issued to Alice should NOT verify for Bob
    assert!(client.verify_credential(&alice, &hash));
    assert!(!client.verify_credential(&bob, &hash));
}

// ─── Test 7: A student can receive many credentials (≥ 5) ────────────────────
#[test]
fn test_many_credentials_for_one_student() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);

    for seed in 1u8..=5 {
        client.issue_credential(&student, &make_hash(&env, seed));
    }
    for seed in 1u8..=5 {
        assert!(client.verify_credential(&student, &make_hash(&env, seed)));
    }
}

// ─── Test 8: Duplicate hash issuance is rejected ─────────────────────────────
#[test]
#[should_panic(expected = "This credential hash has already been issued to this student")]
fn test_duplicate_hash_panics() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);
    let hash = make_hash(&env, 7);

    client.issue_credential(&student, &hash);
    client.issue_credential(&student, &hash); // should panic
}

// ─── Test 9: Revoking a non-existent hash panics gracefully ──────────────────
#[test]
#[should_panic(expected = "Credential hash not found in student records")]
fn test_revoke_nonexistent_hash_panics() {
    let (env, client, _) = setup();
    let student = Address::generate(&env);
    let hash_issued = make_hash(&env, 3);
    let hash_unknown = make_hash(&env, 4);

    client.issue_credential(&student, &hash_issued);
    client.revoke_credential(&student, &hash_unknown); // should panic
}

// ─── Test 10: Admin transfer hands control to the new admin ──────────────────
#[test]
fn test_admin_transfer_new_admin_can_issue() {
    let (env, client, _) = setup();
    let new_admin = Address::generate(&env);
    let student = Address::generate(&env);
    let hash = make_hash(&env, 8);

    // Transfer admin powers; mock_all_auths covers both admins
    client.transfer_admin(&new_admin);

    // New admin should be able to issue a credential
    client.issue_credential(&student, &hash);
    assert!(client.verify_credential(&student, &hash));
}

// ─── Test 11: Admin transfer locks out old admin ─────────────────────────────
#[test]
#[should_panic]
fn test_admin_transfer_security() {
    let (env, client, _) = setup();
    let new_admin = Address::generate(&env);
    let student = Address::generate(&env);
    let hash = make_hash(&env, 5);

    client.transfer_admin(&new_admin);

    // Clear all auth mocks; old admin no longer has authority
    env.set_auths(&[]);

    // This must panic because the old admin is no longer authorized
    client.issue_credential(&student, &hash);
}

// ─── Test 12: Second initialize call is rejected ─────────────────────────────
#[test]
#[should_panic(expected = "Contract is already initialized")]
fn test_double_initialize_panics() {
    let (env, client, _) = setup();
    let another_admin = Address::generate(&env);

    // setup() already called initialize; calling it again must panic
    client.initialize(&another_admin);
}