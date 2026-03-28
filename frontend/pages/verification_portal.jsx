import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { hashFile } from '../utils/hashing';

const VerificationPortal = () => {
    const [searchParams] = useSearchParams();
    const { walletAddress, connect, disconnect, isConnecting, verifyCredential, getStudentProfile } = useWallet();
    const [studentAddress, setStudentAddress] = useState("");
    const [docHash, setDocHash] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null); // { isValid: boolean, checked: boolean, profile: object }

    useEffect(() => {
        const address = searchParams.get('address');
        const hash = searchParams.get('hash');
        if (address) setStudentAddress(address);
        if (hash) setDocHash(hash);
    }, [searchParams]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const hash = await hashFile(file);
            setDocHash(hash);
            setResult(null);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!studentAddress || !docHash) return;

        setIsVerifying(true);
        try {
            const isValid = await verifyCredential(studentAddress, docHash);
            
            let profile = null;
            if (isValid) {
                profile = await getStudentProfile(studentAddress);
            }

            setResult({ 
                isValid, 
                checked: true, 
                timestamp: new Date().toUTCString(),
                profile
            });
        } catch (err) {
            console.error("Verification failed:", err);
            setResult({ isValid: false, checked: true, error: true });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface">
            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .academic-gradient {
                    background: linear-gradient(135deg, #00113a 0%, #758dd5 100%);
                }
            `}} />

            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm dark:shadow-none">
                <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-black tracking-tighter text-blue-900 dark:text-white font-headline">
                        VeracityLink
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-headline text-sm font-semibold tracking-tight">
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-100 transition-colors" to="/">Dashboard</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-100 transition-colors" to="/profile">Profile</Link>
                        <Link className="text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 pb-1" to="/verify">Verify</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={walletAddress ? disconnect : connect}
                            disabled={isConnecting}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold academic-gradient text-white shadow-sm active:scale-95 transition-all disabled:opacity-50 font-headline"
                        >
                            {isConnecting ? "Connecting..." : (walletAddress && typeof walletAddress === 'string' ? "Disconnect" : "Connect Wallet")}
                        </button>
                    </div>
                </nav>
            </header>

            <main className="flex-grow pt-32 pb-20 px-6 max-w-5xl mx-auto w-full">
                {/* Hero Section */}
                <div className="mb-16 text-left">
                    <span className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">
                        Verification Portal
                    </span>
                    <h1 className="text-5xl font-extrabold font-headline tracking-tight text-primary mb-4">
                        Verify Authenticity
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
                        Instantly validate credentials using our decentralized trust layer.
                        VeracityLink leverages Soroban smart contracts on Stellar to ensure
                        every hash is immutable and issuer-signed.
                    </p>
                </div>

                {/* Main Interaction Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-12 xl:col-span-7 bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-xl">
                        <form className="space-y-6" onSubmit={handleVerify}>
                            <div className="p-10 border-2 border-dashed border-outline-variant/30 rounded-3xl bg-white/50 text-center group hover:border-blue-500 transition-all cursor-pointer relative mb-8">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                                <span className="material-symbols-outlined text-5xl text-outline group-hover:text-blue-500 mb-3 transition-colors">upload_file</span>
                                <div className="text-sm font-bold text-primary">Drop credentials here to verify</div>
                                <div className="text-[10px] text-outline mt-1 uppercase font-black tracking-widest">Local Hashing • Zero-Knowledge</div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Student Address</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-on-surface shadow-inner text-sm font-mono"
                                        placeholder="G... (Stellar Public Key)"
                                        value={studentAddress}
                                        onChange={(e) => setStudentAddress(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Calculated Hash</label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-4 py-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-[10px] font-mono text-blue-900 shadow-inner"
                                            value={docHash}
                                            onChange={(e) => { setDocHash(e.target.value); setResult(null); }}
                                            placeholder="Paste SHA-256 Hash or Upload File above..."
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">fingerprint</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full academic-gradient text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-headline disabled:opacity-50"
                                type="submit"
                                disabled={isVerifying || !docHash}
                            >
                                <span className="material-symbols-outlined">{isVerifying ? 'sync' : 'verified'}</span>
                                {isVerifying ? 'Verifying on Stellar...' : 'Run Cryptographic Scan'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                        {result && result.checked && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                                <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl transition-all ${result.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-center gap-4 mb-8 text-left">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${result.isValid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            <span className="material-symbols-outlined text-3xl font-bold">{result.isValid ? 'check_circle' : 'cancel'}</span>
                                        </div>
                                        <div>
                                            <h3 className={`text-2xl font-black font-headline ${result.isValid ? 'text-emerald-900' : 'text-red-900'}`}>
                                                {result.isValid ? 'Authentic Record' : 'Invalid / Revoked'}
                                            </h3>
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Stellar Ledger Verification</p>
                                        </div>
                                    </div>

                                    {/* NEW: Student Details Section */}
                                    {result.isValid && result.profile && (
                                        <div className="mb-8 p-6 bg-white/60 rounded-3xl border border-emerald-100 flex items-center gap-5 text-left animate-in slide-in-from-left duration-700">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm bg-white shrink-0">
                                                {result.profile.profile_pic ? (
                                                    <img src={result.profile.profile_pic} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <span className="material-symbols-outlined text-2xl">account_circle</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1 leading-none">Verified Recipient</div>
                                                <div className="text-lg font-black text-primary truncate leading-tight">{result.profile.name}</div>
                                                <div className="text-[11px] font-bold text-on-surface-variant opacity-60 truncate">{result.profile.email}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-6 border-t border-black/5 text-left">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-black/40">
                                            <span>Ledger Status</span>
                                            <span className={result.isValid ? 'text-emerald-600' : 'text-red-600'}>{result.isValid ? 'VALIDATED' : 'REJECTED'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-black/40">
                                            <span>Verification Time</span>
                                            <span className="text-primary">{result.timestamp}</span>
                                        </div>
                                        <div className="mt-6 p-4 bg-white/50 rounded-xl font-mono text-[9px] break-all border border-white">
                                            CRYPTO PROOF: {docHash.slice(0, 32)}...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm space-y-6">
                            <h3 className="font-headline font-black text-xl text-primary">How Verification Works</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="text-xs font-black text-blue-500 mt-1">01</div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">The document is hashed locally. Your private data never touches the network.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="text-xs font-black text-blue-500 mt-1">02</div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">The hash is compared against the immutable registry on the Stellar Testnet.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="text-xs font-black text-blue-500 mt-1">03</div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">If the hash exists and the university hasn't revoked it, you get an instant 'Verified' proof.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full bg-slate-50 py-12 border-t border-slate-200 mt-20">
                <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                    <div className="font-manrope font-black text-xl text-primary">VeracityLink</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 VeracityLink. Powered by Stellar.</p>
                </div>
            </footer>
        </div>
    );
};

export default VerificationPortal;
