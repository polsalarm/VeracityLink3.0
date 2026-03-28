import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

const StudentProfile = () => {
    const navigate = useNavigate();
    const { 
        walletAddress, connect, disconnect, isConnecting, truncateAddress, 
        getCredentials, getStudentProfile 
    } = useWallet();
    
    const [liveCredentials, setLiveCredentials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [onchainProfile, setOnchainProfile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (walletAddress) {
                setIsLoading(true);
                try {
                    // 1. Fetch Profile
                    const profile = await getStudentProfile(walletAddress);
                    setOnchainProfile(profile);

                    // 2. Fetch Credentials
                    const data = await getCredentials(walletAddress);
                    setLiveCredentials(data || []);
                } catch (err) {
                    console.error("Failed to fetch profile data:", err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setOnchainProfile(null);
                setLiveCredentials([]);
            }
        };
        fetchData();
    }, [walletAddress, getCredentials, getStudentProfile]);

    const displayedCredentials = useMemo(() => {
        return liveCredentials;
    }, [liveCredentials]);

    return (
        <div className="min-h-screen bg-surface font-body text-on-surface">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <Link className="text-2xl font-black tracking-tighter text-blue-900 font-headline" to="/">
                        VeracityLink
                    </Link>
                    <div className="hidden md:flex items-center space-x-8 font-headline text-sm font-semibold tracking-tight">
                        <Link className="text-slate-600 hover:text-blue-900 transition-colors" to="/">Dashboard</Link>
                        <Link className="text-blue-700 border-b-2 border-blue-700 pb-1" to="/profile">Profile</Link>
                        <Link className="text-slate-600 hover:text-blue-900 transition-colors" to="/verify">Verify</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={walletAddress ? disconnect : connect}
                            disabled={isConnecting}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm active:scale-95 transition-all disabled:opacity-50 font-headline" 
                            style={{ background: 'linear-gradient(135deg, #00113a 0%, #758dd5 100%)' }}
                        >
                            {isConnecting ? "Connecting..." : (walletAddress ? `${truncateAddress(walletAddress)} · Disconnect` : "Connect Wallet")}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-on-surface">
                
                {/* Profile Header Block */}
                <section className="bg-surface-container-low p-8 md:p-12 rounded-[3.5rem] border border-outline-variant/10 mb-12 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            {onchainProfile?.profile_pic ? (
                                <img src={onchainProfile.profile_pic} className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover bg-white" alt="Profile" />
                            ) : (
                                <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                                    <span className="material-symbols-outlined text-5xl">account_circle</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-left duration-1000">
                                <span className="material-symbols-outlined text-[16px] leading-none drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>verified</span>
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] leading-none">
                                    {onchainProfile ? "Verified On-Chain Alumnus" : "Awaiting Verification"}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-primary">
                                {isLoading ? "..." : (onchainProfile?.name || "Student Profile")}
                            </h1>
                            <p className="text-slate-500 font-bold font-mono text-sm">{onchainProfile?.email || "Academic Record Pending"}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <div className="bg-white border border-outline-variant/20 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                                    <span className="material-symbols-outlined text-sm text-outline">account_balance_wallet</span>
                                    <span className="font-mono text-[10px] text-on-surface-variant">
                                        {walletAddress ? truncateAddress(walletAddress) : "Wallet Disconnected"}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => navigate('/verify')}
                                    className="bg-white border border-outline-variant/20 px-4 py-2 rounded-xl font-headline font-bold text-xs text-primary flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">share</span>
                                    Verify Info
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsSyncing(true);
                                        // Refetch using force=true (Background Sync)
                                        Promise.all([
                                            getStudentProfile(walletAddress, true),
                                            getCredentials(walletAddress, true)
                                        ]).then(([p, c]) => {
                                            setOnchainProfile(p);
                                            setLiveCredentials(c || []);
                                            setIsSyncing(false);
                                        });
                                    }}
                                    disabled={isSyncing}
                                    className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl font-headline font-bold text-xs text-primary flex items-center gap-2 hover:bg-primary/10 transition-all shadow-sm disabled:opacity-50"
                                >
                                    <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                                    {isSyncing ? 'Syncing...' : 'Refresh Ledger'}
                                </button>
                            </div>
                        </div>
                        <div className="md:ml-auto p-6 bg-white rounded-3xl border border-outline-variant/10 text-center space-y-2 shadow-sm min-w-[150px]">
                            <div className="text-3xl font-black text-primary">{isLoading ? "..." : liveCredentials.length}</div>
                            <div className="text-[10px] font-black uppercase text-outline tracking-wider">Blockchain Records</div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Panel: Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-white p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-sm space-y-10">
                            <h3 className="font-headline font-black text-2xl text-primary">Ownership Status</h3>
                            <div className="space-y-6 text-left">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">shield_person</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-outline mb-1">Ownership</div>
                                        <div className="text-sm font-bold text-primary leading-tight">Master Ledger Records</div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs text-slate-500 italic leading-relaxed">
                                        All records shown here are anchored on the Stellar blockchain. Only YOU can share these cryptographic proofs with employers.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Panel: Academic Wallet */}
                    <div className="lg:col-span-8 space-y-10">
                        <section>
                            <header className="flex justify-between items-baseline mb-10">
                                <h2 className="text-3xl font-headline font-black text-primary">Academic Wallet</h2>
                                <div className="h-[1px] flex-grow mx-8 bg-outline-variant/20"></div>
                                {isLoading && (
                                    <div className="animate-pulse text-[10px] font-black text-outline uppercase tracking-widest">Querying Ledger...</div>
                                )}
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {displayedCredentials.length === 0 ? (
                                    <div className="md:col-span-2 p-16 rounded-[4rem] border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                                            <span className="material-symbols-outlined text-6xl">school</span>
                                        </div>
                                        <div className="space-y-2 max-w-sm">
                                            <h3 className="font-headline font-black text-2xl text-primary">No Verified Records</h3>
                                            <p className="text-sm text-on-surface-variant font-medium">
                                                Your decentralized academic history is currently empty. Contact your 
                                                university registrar to anchor your transcripts to the Stellar network.
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                                        >
                                            Check for Updates
                                        </button>
                                    </div>
                                ) : (
                                    displayedCredentials.map((cred, i) => (
                                        <div key={i} className={`p-8 rounded-[3rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl transition-all group ${cred.is_valid ? 'bg-white' : 'bg-red-50 opacity-80'}`}>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-3xl text-primary">verified</span>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cred.is_valid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-500 text-white'}`}>
                                                    {cred.is_valid ? 'Verified Record' : 'Revoked'}
                                                </div>
                                            </div>
                                            <div className="space-y-1 mb-8 text-left">
                                                <h4 className="font-headline font-black text-xl text-primary leading-tight">
                                                    {cred.label || "Academic Degree/Certificate"}
                                                </h4>
                                                <p className="text-[10px] font-black text-outline uppercase tracking-widest leading-relaxed">Securely Anchored on Stellar Soroban</p>
                                            </div>
                                            <div className="space-y-4 pt-6 border-t border-outline-variant/10 text-left">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Cryptographic Proof (SHA-256)</span>
                                                    <div className="bg-slate-50 p-4 rounded-xl font-mono text-[9px] break-all border border-slate-100 group-hover:border-primary/20 transition-colors">
                                                        {typeof cred.doc_hash === 'string' ? cred.doc_hash : (cred.doc_hash.toString('hex') || "e3b0c44...9fb")}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                                                <button 
                                                    onClick={() => navigate(`/verify?address=${walletAddress}&hash=${typeof cred.doc_hash === 'string' ? cred.doc_hash : cred.doc_hash.toString('hex')}`)}
                                                    className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
                                                >
                                                    Share for Verification <span className="material-symbols-outlined text-xs">share</span>
                                                </button>
                                                <div className="text-[9px] font-bold text-outline opacity-40 uppercase tracking-[0.2em]">Immutable Proof</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-slate-50 py-12 border-t border-slate-200 mt-20">
                <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                    <div className="font-manrope font-black text-xl text-primary">VeracityLink</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 VeracityLink. Powered by Stellar.</p>
                </div>
            </footer>
        </div>
    );
};

export default StudentProfile;
