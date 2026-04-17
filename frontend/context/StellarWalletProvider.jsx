import React, { useState, useCallback } from 'react';
import * as StellarSdk from "@stellar/stellar-sdk";
import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
import { WalletContext } from './StellarWalletContext.js';

const {
    rpc,
    Contract,
    TransactionBuilder,
    BASE_FEE,
    xdr,
    nativeToScVal,
    scValToNative,
    Account,
    Transaction,
    FeeBumpTransaction,
} = StellarSdk;

const RPC_URL = import.meta.env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASS = import.meta.env.VITE_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "CCSVKSIFPWVSO3NICR54BALEXQMOBJOA45IH2F2UADL2JAPKNAB5QN5C";

const server = new rpc.Server(RPC_URL);
const contract = CONTRACT_ID ? new Contract(CONTRACT_ID) : null;

const DUMMY_ACCOUNT = new Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"
);

console.log("-----------------------------------------");
console.log("VeracityLink: Blockchain Provider Ready");
console.log("SDK: v13 | Freighter API: v4");
console.log("Contract:", CONTRACT_ID || "NOT SET");
console.log("Network:", NETWORK_PASS);
console.log("-----------------------------------------");

function buildSimTx(operation) {
    return new TransactionBuilder(DUMMY_ACCOUNT, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASS,
    })
        .addOperation(operation)
        .setTimeout(30)
        .build();
}

// Reconstruct signed tx from XDR — handles all envelope types in v13
// switch().value: 0=TxV0, 2=Tx(v1), 5=FeeBump
function fromSignedXdr(signedXdr) {
    const envelope = xdr.TransactionEnvelope.fromXDR(signedXdr, 'base64');
    const switchVal = envelope.switch().value;
    console.log("Envelope switch value:", switchVal);
    if (switchVal === 5) return new FeeBumpTransaction(envelope, NETWORK_PASS);
    return new Transaction(envelope, NETWORK_PASS);
}

export const StellarWalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    
    // Performance Cache: Avoid redundant ledger queries
    const [cachedProfiles, setCachedProfiles] = useState({}); // { addr: profile }
    const [cachedCredentials, setCachedCredentials] = useState({}); // { addr: creds[] }

    const extractAddress = useCallback((result) => {
        if (!result) return null;
        if (typeof result === 'string') return result;
        if (typeof result === 'object') {
            return result.address || result.publicKey || (Array.isArray(result) ? result[0] : null);
        }
        return null;
    }, []);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const connected = await isConnected();
            if (!connected) {
                setError("Freighter not found. Opening download page...");
                // Small delay so the user can read the toast before being moved
                setTimeout(() => window.open("https://www.freighter.app/", "_blank"), 1500);
                return;
            }
            
            // Request access from the extension
            const result = await requestAccess();
            let address = extractAddress(result);
            
            // Fallback: Some versions of Freighter API return empty on requestAccess
            // requiring an explicit getAddress() call afterward
            if (!address) {
                const data = await getAddress();
                address = extractAddress(data);
            }
            
            if (address) {
                setWalletAddress(address);
                console.log("Wallet connected:", address);
            } else {
                throw new Error("Could not retrieve wallet address. Please check Freighter.");
            }
        } catch (err) {
            console.error("Wallet connection error:", err);
            setError(err.message || "Failed to connect wallet.");
        } finally {
            setIsConnecting(false);
        }
    }, [extractAddress]);

    const disconnect = useCallback(() => {
        setWalletAddress(null);
        setCachedProfiles({});
        setCachedCredentials({});
    }, []);

    const truncateAddress = useCallback((address) => {
        if (!address || typeof address !== 'string') return "";
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }, []);

    const fundAccount = useCallback(async () => {
        if (!walletAddress) return;
        setIsConnecting(true);
        setError(null);
        try {
            const res = await fetch(`https://friendbot.stellar.org/?addr=${walletAddress}`);
            if (!res.ok) throw new Error("Friendbot failed. Account may already be funded.");
            console.log("Funded successfully!");
        } catch (err) {
            console.error("Funding Error:", err);
            setError(err.message);
        } finally {
            setIsConnecting(false);
        }
    }, [walletAddress]);

    const sendTransaction = useCallback(async (preparedTx) => {
        if (!server) throw new Error("RPC server not initialized");

        const addrResult = await getAddress();
        const activeWallet = extractAddress(addrResult);
        if (activeWallet !== walletAddress) {
            throw new Error(`Account mismatch. Freighter: ${String(activeWallet).slice(0, 4)}... App: ${String(walletAddress).slice(0, 4)}...`);
        }

        // toEnvelope().toXDR() preserves Soroban auth entries from prepareTransaction()
        const txXdr = preparedTx.toEnvelope().toXDR('base64');
        console.log("Sending to Freighter for signing...");

        const signedResult = await signTransaction(txXdr, {
            accountToSign: walletAddress,
            networkPassphrase: NETWORK_PASS,
        });

        console.log("Freighter result:", signedResult);

        const signedXdr =
            typeof signedResult === 'string' ? signedResult
                : signedResult?.signedTxXdr
                ?? signedResult?.signedTransaction
                ?? signedResult?.xdr
                ?? null;

        if (!signedXdr || typeof signedXdr !== 'string') {
            throw new Error("No signed XDR returned. Did you reject the transaction?");
        }

        const signedTx = fromSignedXdr(signedXdr);
        const response = await server.sendTransaction(signedTx);
        console.log("Broadcast:", response.status, response.hash);

        if (response.status === "ERROR") {
            throw new Error(`Broadcast failed: ${JSON.stringify(response.errorResultXdr ?? response)}`);
        }

        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const result = await server.getTransaction(response.hash);
            console.log(`Poll ${i + 1}/20: ${result.status}`);
            if (result.status === "SUCCESS") {
                console.log("Confirmed:", response.hash);
                return { ...result, hash: response.hash };
            }
            if (result.status !== "NOT_FOUND") {
                throw new Error(`Transaction failed: ${result.status}`);
            }
        }
        throw new Error("Timed out waiting for confirmation.");
    }, [walletAddress, extractAddress]);

    // ── Read-only simulations ─────────────────────────────────────────────────

    const getAdmin = useCallback(async () => {
        if (!contract) return null;
        try {
            const sim = await server.simulateTransaction(
                buildSimTx(contract.call("get_admin"))
            );
            if (sim.error) {
                console.error("getAdmin sim error:", sim.error);
                return null;
            }
            return sim.result ? scValToNative(sim.result.retval) : null;
        } catch (err) {
            console.error("getAdmin error:", err);
            return null;
        }
    }, []);

    const verifyCredential = useCallback(async (studentAddr, docHash) => {
        if (!contract) return false;
        try {
            const hexClean = docHash.replace(/^0x/, '');
            const hashBytes = new Uint8Array(hexClean.match(/.{2}/g).map(b => parseInt(b, 16)));
            const sim = await server.simulateTransaction(buildSimTx(
                contract.call(
                    "verify_credential",
                    nativeToScVal(studentAddr, { type: 'address' }),
                    xdr.ScVal.scvBytes(hashBytes) // <-- FIX IS HERE
                )
            ));
            return sim.result ? scValToNative(sim.result.retval) : false;
        } catch (err) {
            console.error("verifyCredential error:", err);
            return false;
        }
    }, []);

    const getCredentials = useCallback(async (studentAddr, force = false) => {
        if (!contract) return [];
        
        // Cache Hit: Instantly return if already fetched (skip if force=true)
        if (!force && cachedCredentials[studentAddr]) {
            console.log(`Cache Hit: Credentials for ${studentAddr.slice(0, 4)}...`);
            return cachedCredentials[studentAddr];
        }

        try {
            const sim = await server.simulateTransaction(buildSimTx(
                contract.call("get_credentials", nativeToScVal(studentAddr, { type: 'address' }))
            ));
            if (sim.result) {
                const creds = scValToNative(sim.result.retval);
                
                // Only update cache if data actually changed (prevents infinite loops)
                if (JSON.stringify(creds) !== JSON.stringify(cachedCredentials[studentAddr])) {
                    setCachedCredentials(prev => ({ ...prev, [studentAddr]: creds }));
                }
                return creds;
            }
            return [];
        } catch (err) {
            console.error("getCredentials error:", err);
            return [];
        }
    }, [cachedCredentials]);

    const registerStudent = useCallback(async (name, email, idHash, profilePic) => {
        if (!walletAddress || !contract) throw new Error("Wallet or contract not ready.");
        const account = await server.getAccount(walletAddress);
        const tx = new TransactionBuilder(account, { fee: "100000", networkPassphrase: NETWORK_PASS })
            .addOperation(contract.call("register_student", 
                nativeToScVal(walletAddress, { type: 'address' }),
                nativeToScVal(name, { type: 'string' }),
                nativeToScVal(email, { type: 'string' }),
                xdr.ScVal.scvBytes(new Uint8Array(idHash.match(/.{2}/g).map(b => parseInt(b, 16)))),
                nativeToScVal(profilePic || "", { type: 'string' })
            ))
            .setTimeout(300)
            .build();
        const preparedTx = await server.prepareTransaction(tx);
        const res = await sendTransaction(preparedTx);
        
        // Post-Write: Eagerly update local cache for smooth UX
        if (res.hash) {
            setCachedProfiles(prev => ({ 
                ...prev, 
                [walletAddress]: { name, email, profile_pic: profilePic } 
            }));
        }
        return res;
    }, [walletAddress, sendTransaction]);

    const getStudentProfile = useCallback(async (studentAddr, force = false) => {
        if (!contract) return null;
        
        // Cache Hit: Instantly return if already fetched (skip if force=true)
        if (!force && cachedProfiles[studentAddr]) {
            console.log(`Cache Hit: Profile for ${studentAddr.slice(0, 4)}...`);
            return cachedProfiles[studentAddr];
        }

        try {
            const sim = await server.simulateTransaction(buildSimTx(
                contract.call("get_student_profile", nativeToScVal(studentAddr, { type: 'address' }))
            ));
            if (sim.error) return null;
            if (sim.result) {
                const profile = scValToNative(sim.result.retval);

                // Only update cache if data actually changed (prevents infinite loops)
                if (JSON.stringify(profile) !== JSON.stringify(cachedProfiles[studentAddr])) {
                    setCachedProfiles(prev => ({ ...prev, [studentAddr]: profile }));
                }
                return profile;
            }
            return null;
        } catch (err) {
            console.error("getStudentProfile error:", err);
            return null;
        }
    }, [cachedProfiles]);

    const getAllStudents = useCallback(async () => {
        if (!contract) return [];
        try {
            const sim = await server.simulateTransaction(buildSimTx(
                contract.call("get_all_students")
            ));
            if (sim.error) return [];
            return sim.result ? scValToNative(sim.result.retval) : [];
        } catch (err) {
            console.error("getAllStudents error:", err);
            return [];
        }
    }, []);

    // ── Write calls ───────────────────────────────────────────────────────────

    const initialize = useCallback(async (adminAddr) => {
        if (!walletAddress || !contract) throw new Error("Wallet or contract not ready.");
        const account = await server.getAccount(walletAddress);
        const tx = new TransactionBuilder(account, { fee: "100000", networkPassphrase: NETWORK_PASS })
            .addOperation(contract.call("initialize", nativeToScVal(adminAddr, { type: 'address' })))
            .setTimeout(300)
            .build();
        const preparedTx = await server.prepareTransaction(tx);
        return await sendTransaction(preparedTx);
    }, [walletAddress, sendTransaction]);

    const issueCredential = useCallback(async (studentAddr, docHash) => {
        if (!walletAddress || !contract) throw new Error("Wallet or contract not ready.");
        const hexClean = docHash.replace(/^0x/, '');
        if (hexClean.length !== 64) throw new Error(`Invalid SHA-256: expected 64 hex chars, got ${hexClean.length}`);
        const hashBytes = new Uint8Array(hexClean.match(/.{2}/g).map(b => parseInt(b, 16)));

        const account = await server.getAccount(walletAddress);
        const tx = new TransactionBuilder(account, { fee: "100000", networkPassphrase: NETWORK_PASS })
            .addOperation(contract.call(
                "issue_credential",
                nativeToScVal(studentAddr, { type: 'address' }),
                xdr.ScVal.scvBytes(hashBytes) // <-- FIX IS HERE
            ))
            .setTimeout(300)
            .build();
        const preparedTx = await server.prepareTransaction(tx);
        const res = await sendTransaction(preparedTx);
        
        // Post-Write: Invalidate credits cache to force re-fetch
        if (res.hash) {
            setCachedCredentials(prev => {
                const next = { ...prev };
                delete next[studentAddr];
                return next;
            });
        }
        return res;
    }, [walletAddress, sendTransaction]);

    const revokeCredential = useCallback(async (studentAddr, docHash) => {
        if (!walletAddress || !contract) throw new Error("Wallet or contract not ready.");
        const hexClean = docHash.replace(/^0x/, '');
        const hashBytes = new Uint8Array(hexClean.match(/.{2}/g).map(b => parseInt(b, 16)));

        const account = await server.getAccount(walletAddress);
        const tx = new TransactionBuilder(account, { fee: "100000", networkPassphrase: NETWORK_PASS })
            .addOperation(contract.call(
                "revoke_credential",
                nativeToScVal(studentAddr, { type: 'address' }),
                xdr.ScVal.scvBytes(hashBytes) // <-- FIX IS HERE
            ))
            .setTimeout(300)
            .build();
        const preparedTx = await server.prepareTransaction(tx);
        const res = await sendTransaction(preparedTx);

        // Post-Write: Invalidate credits cache to force re-fetch
        if (res.hash) {
            setCachedCredentials(prev => {
                const next = { ...prev };
                delete next[studentAddr];
                return next;
            });
        }
        return res;
    }, [walletAddress, sendTransaction]);

    const contextValue = React.useMemo(() => ({
        walletAddress,
        isConnecting,
        error,
        connect,
        disconnect,
        truncateAddress,
        server,
        contract,
        NETWORK_PASS,
        fundAccount,
        initialize,
        issueCredential,
        revokeCredential,
        verifyCredential,
        getCredentials,
        getAdmin,
        registerStudent,
        getStudentProfile,
        getAllStudents,
    }), [
        walletAddress, isConnecting, error, connect, disconnect, 
        truncateAddress, fundAccount, initialize, issueCredential, 
        revokeCredential, verifyCredential, getCredentials, 
        getAdmin, registerStudent, getStudentProfile, getAllStudents
    ]);

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};