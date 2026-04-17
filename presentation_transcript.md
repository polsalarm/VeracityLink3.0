# 🎤 VeracityLink: 10-Minute Presentation Script

**Project:** VeracityLink – The Decentralized Academic Registry  
**Tech Stack:** Soroban (Rust), React + Vite, Freighter Wallet, Stellar SDK v13  
**Target Duration:** ~10 minutes

---

## ⏱️ 0:00 - 1:00 | Introduction: The Problem & The Solution

**"Hello everyone, I'm Paul Henry Dacalan, and today I’m presenting VeracityLink."**

*   **The Problem:** Ask yourself, how do employers verify a degree today? They have to call university clerks, go through slow centralized clearinghouses, and wait days or weeks. Paper diplomas are easily photoshopped, and PDF attachments are meaningless. It’s a broken, siloed system.
*   **The Solution:** VeracityLink fixes this by moving academic credentials to the blockchain. We use the Stellar network and Soroban smart contracts to create a decentralized, tamper-proof academic registry.
*   **How it works:** Instead of putting your entire private transcript on a public ledger, we use a non-custodial privacy model. We take your academic document, generate a unique SHA-256 cryptographic hash, and anchor *only that hash* to the blockchain. The employer then compares their copy of the document against the blockchain. If the hashes match, the degree is 100% authentic.

---

## ⏱️ 1:00 - 3:00 | Why Stellar & Soroban? 

**"When deciding what infrastructure to build this on, I specifically chose Stellar and Soroban for a few critical reasons:"**

1.  **Speed (Instant Finality):** Employers evaluating candidates don’t have time to wait 10 minutes for block confirmations or pay huge gas fees. Stellar gives us instant finality.
2.  **Soroban (Rust SDK):** Writing the smart contract in Rust provided incredible safety. I didn't want to deal with the typical reentrancy bugs you find in EVM Solidity contracts. Rust enforces memory safety at the compiler level, which is perfect for an immutable identity registry.
3.  **Low Friction:** The cost to issue a single diploma hash on Stellar is a fraction of a cent. This means universities could issue a graduating class of 10,000 students for virtually zero cost compared to traditional database maintenance.

---

## ⏱️ 3:00 - 5:30 | Building The Smart Contract (The Backend)

**"Let's get into the engineering. The core of VeracityLink is a single, highly optimized Soroban smart contract."**

*   **On-Chain Storage Architecture:** I utilized Soroban's storage models carefully. The "Master Registrar" or the Admin key is stored in `Instance` storage, meaning it's tied globally to the contract. The individual student records and arrays of their diplomas are placed in `Persistent` storage because they need to live forever and be individually scalable.
*   **Structs and Types:** I created a `StudentProfile` struct to hold basic meta-info, and a `Credential` struct that holds the 32-byte `doc_hash` and a boolean `is_valid` flag.
*   **The Revocation Engine:** This was a fun challenge. If an institution makes a mistake or someone's degree gets revoked, you can't just "delete" data off a blockchain. Instead, I built a `revoke_credential` function. It finds the specific hash in the student's vector, flips the `is_valid` boolean to `false`, and saves it back. The history is preserved, but any future employer who tries to verify it will immediately get a rejection.

---

## ⏱️ 5:30 - 7:00 | Testing & Security

**"Because we are dealing with identity and academic truth, security was my top priority."**

*   Before ever touching the frontend, I wrote **12 comprehensive automated tests** directly in Rust using the Soroban Test framework using snapshot states.
*   I tested specific failure conditions: What happens if someone tries to `initialize` the contract twice trying to steal admin rights? It panics. What happens if an admin accidentally tries to issue the exact same document hash twice to the same student? The contract catches the duplicate using an index loop and reverts the transaction to prevent ledger bloat.
*   All tests manipulate mock environments to ensure that standard users or students are completely blocked (`require_auth()`) from mutating institutional records.

---

## ⏱️ 7:00 - 9:00 | The Frontend & Freighter Wallet Integration

**"With a secure backend, I moved to the frontend: a clean, responsive React and Vite application using Tailwind CSS."**

*   **The Sync Engine:** The biggest challenge in Web3 frontends is keeping the UI in sync with the blockchain. I built a custom `StellarWalletProvider` context. This acts as a universal sync engine, wrapping the Stellar SDK and the Freighter API into easy-to-use hooks.
*   **The Vercel / Freighter Challenge:** During development, everything worked perfectly on `localhost`. But when I deployed to production on Vercel, the Freighter wallet suddenly started hanging indefinitely! There were no errors, the popup just wouldn't appear.
*   **The Fix:** I dug into the API documentation and realized that Freighter has an internal "allow-list". On localhost, it auto-approves requests, but on production domains, standard requests will hang silently unless the site is first added to the allow-list. I refactored my connection flow to explicitly check `isAllowed()`, prompt `setAllowed()`, and then process `requestAccess()`—wrapped in a `Promise.race()` timeout just in case the extension froze. It was a great lesson in handling Web3 edge cases.

---

## ⏱️ 9:00 - 10:00 | Conclusion & Roadmap

**"To wrap up, VeracityLink successfully proves that we can completely rethink how credentials are managed."**

*   By combining **React** on the frontend, **Freighter** for secure identity signing, and **Soroban** for an immutable, fast backend, we've built a system where trust is mathematical, and verification is instant.
*   **Next Steps:** My future roadmap includes creating a DAO architecture where multiple universities can share a single contract, and integrating IPFS so the AES-encrypted JSON files of the actual transcripts can be decentralized as well.

**"Thank you for listening, and I'd be happy to answer any questions."**
