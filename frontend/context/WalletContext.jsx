import React, { useState, useCallback, useEffect } from 'react';
import * as StellarSdk from "@stellar/stellar-sdk";
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';
import { WalletContext } from './WalletContext.js';

const { SorobanRpc, rpc, Networks, Contract } = StellarSdk;

const RPC_URL = import.meta.env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASS = import.meta.env.VITE_NETWORK_PASSPHRASE ?? (Networks?.TESTNET || "Test SDF Network ; September 2015");
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? "YOUR_CONTRACT_ID";

// RPC initialization with fallback for different SDK versions
const RPC = SorobanRpc || rpc;
const server = RPC ? new RPC.Server(RPC_URL) : null;
const contract = (CONTRACT_ID !== "YOUR_CONTRACT_ID" && Contract) ? new Contract(CONTRACT_ID) : null;

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    // Helper to safely extract address string from Freighter response
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
            if (!(await isConnected())) {
                setError("Freighter extension not found. Please install it to continue.");
                return;
            }

            // requestAccess prompts the user to allow the site
            const result = await requestAccess();
            const address = extractAddress(result);
            
            if (address) {
                setWalletAddress(address);
                console.log("Connected to Wallet:", address);
            } else {
                // Fallback for some versions of the API
                const data = await getAddress();
                const fallbackAddress = extractAddress(data);
                if (fallbackAddress) {
                    setWalletAddress(fallbackAddress);
                }
            }
        } catch (err) {
            setError(err.message || "Failed to connect wallet");
            console.error("Connection Error:", err);
        } finally {
            setIsConnecting(false);
        }
    }, [extractAddress]);

    const disconnect = useCallback(() => {
        setWalletAddress(null);
    }, []);

    const truncateAddress = useCallback((address) => {
        if (!address || typeof address !== 'string') return "";
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }, []);


    return (
        <WalletContext.Provider value={{
            walletAddress,
            isConnecting,
            error,
            connect,
            disconnect,
            truncateAddress,
            server,
            contract,
            NETWORK_PASS
        }}>
            {children}
        </WalletContext.Provider>
    );
};
