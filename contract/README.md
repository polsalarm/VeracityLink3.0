# VeracityLink | Soroban Smart Contract

> **VeracityLink** is a decentralized academic credential verification system built on Stellar's Soroban smart contract platform. It anchors SHA-256 cryptographic proofs of scholarly achievements to an immutable ledger, ensuring that degree documents are tamper-proof, instantly verifiable, and globally accessible.

---

## 📡 Deployed Contract

| Field | Details |
| :--- | :--- |
| **Contract ID** | `CCSVKSIFPWVSO3NICR54BALEXQMOBJOA45IH2F2UADL2JAPKNAB5QN5C` |
| **Network** | Stellar Testnet |
| **Deploy Tx** | _Deployed via Stellar CLI_ |
| **Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCSVKSIFPWVSO3NICR54BALEXQMOBJOA45IH2F2UADL2JAPKNAB5QN5C) |

---

## 📜 Contract Functions

| Function | Description |
| :--- | :--- |
| `initialize(admin)` | Sets the Master Registrar (Admin) address. Can only be called once to prevent contract takeover. |
| `get_admin()` | Returns the current admin address stored on-chain. Used by the frontend for role-based access. |
| `transfer_admin(new_admin)` | Transfers admin privileges to a new address. Requires current admin authorization. |
| `register_student(student, name, email, id_hash, profile_pic)` | Registers a new student profile on-chain. The ID is stored as a SHA-256 hash for privacy. |
| `get_student_profile(student)` | Fetches a student's public profile (name, email, hashed ID, profile picture). |
| `get_all_students()` | Returns the global directory of all registered student addresses. |
| `issue_credential(student, doc_hash)` | **Admin-only.** Issues a verifiable credential by appending its SHA-256 hash to the student's record. Prevents duplicates. |
| `revoke_credential(student, doc_hash)` | **Admin-only.** Revokes a credential by flipping its `is_valid` flag to `false`. |
| `verify_credential(student, doc_hash)` | **Public.** Checks if a given document hash exists and is currently valid (not revoked). Returns `true` or `false`. |
| `get_credentials(student)` | Returns all credentials issued to a student, including their validity status. |

---

## 🔧 Prerequisites

Ensure you have the following installed:

```bash
# Rust toolchain with WASM target
rustup target add wasm32-unknown-unknown

# Stellar CLI
cargo install --locked stellar-cli --features opt
```

---

## 🏗️ Build

```bash
cd contract
stellar contract build
```

**Output:** `target/wasm32-unknown-unknown/release/veracity_link.wasm`

---

## 🧪 Test

```bash
cd contract
cargo test
```

**Test Coverage (12 scenarios):**

| Category | Tests |
| :--- | :--- |
| **Initialization** | `test_double_initialize_panics`, `test_initialize_stores_config` |
| **Registration** | `test_credentials_are_per_student`, `test_many_credentials_for_one_student` |
| **Issuance** | `test_issue_and_verify_single_credential`, `test_duplicate_hash_panics` |
| **Revocation** | `test_credential_revocation`, `test_revoke_one_credential_leaves_others_intact`, `test_revoke_nonexistent_hash_panics` |
| **Verification** | `test_verify_unknown_hash_returns_false`, `test_multiple_credentials_issuance` |
| **Access Control** | `test_admin_transfer_new_admin_can_issue`, `test_admin_transfer_security` |

---

## 🚀 Deploy to Testnet

```bash
# Generate and fund a deployer key
stellar keys generate --global my-key --network testnet
stellar keys fund my-key --network testnet

# Build the WASM artifact
cd contract
stellar contract build

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/veracity_link.wasm \
  --source my-key \
  --network testnet
```

---

## 🔗 Frontend Integration

The frontend communicates with this contract via the **Stellar SDK v13** and **Freighter API v4**.

**Environment Variables** (set in `.env` at project root):

```env
VITE_CONTRACT_ID=CCSVKSIFPWVSO3NICR54BALEXQMOBJOA45IH2F2UADL2JAPKNAB5QN5C
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

**Key integration file:** `frontend/context/StellarWalletProvider.jsx`

This provider wraps every contract function into React-friendly async calls, handling transaction building, Freighter signing, and result polling automatically.

---

> **Created & Designed by Paul Henry Dacalan** 🎓✨🛡️
