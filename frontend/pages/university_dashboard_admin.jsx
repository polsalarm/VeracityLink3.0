import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { hashFile } from '../utils/hashing';

const UniversityAdminDashboard = () => {
    const {
        walletAddress, connect, disconnect, isConnecting,
        truncateAddress, issueCredential, initialize, getAdmin, fundAccount,
        getAllStudents, getStudentProfile
    } = useWallet();

    const [studentAddress, setStudentAddress] = useState("");
    const [docHash, setDocHash] = useState("");
    const [fileName, setFileName] = useState("");
    const [isIssuing, setIsIssuing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isFunding, setIsFunding] = useState(false);
    const [status, setStatus] = useState(null);
    const [liveHistory, setLiveHistory] = useState([]);
    const [currentAdminOnChain, setCurrentAdminOnChain] = useState(null);
    const [adminCheckDone, setAdminCheckDone] = useState(false);
    const [registeredStudents, setRegisteredStudents] = useState([]);
    const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);

    const fallbackHistory = [
        { name: "Paul Dacalan", wallet: "GD4K...R3P8", date: "Jan 12, 2026", status: "VERIFIED", tx: "3ec0...f81" },
        { name: "Sarah Miller", wallet: "GA4K...L2P1", date: "Jan 10, 2026", status: "VERIFIED", tx: "b2c8...4f2" },
    ];

    const displayHistory = useMemo(() => [...liveHistory, ...fallbackHistory], [liveHistory]);

    // ── On wallet connect: check admin state with retries ───────────────────
    useEffect(() => {
        if (!walletAddress) {
            setCurrentAdminOnChain(null);
            setAdminCheckDone(false);
            return;
        }

        let cancelled = false;
        const checkAdmin = async () => {
            setAdminCheckDone(false);
            // Retry up to 4 times — RPC can be slow right after connect
            for (let attempt = 0; attempt < 4; attempt++) {
                if (cancelled) return;
                try {
                    const admin = await getAdmin();
                    console.log(`Admin check attempt ${attempt + 1}:`, admin);
                    if (admin) {
                        if (!cancelled) {
                            setCurrentAdminOnChain(admin);
                            setAdminCheckDone(true);
                        }
                        return;
                    }
                } catch (err) {
                    console.error(`Admin check attempt ${attempt + 1} failed:`, err);
                }
                await new Promise(r => setTimeout(r, 1200));
            }
            // After all retries, admin is genuinely null (not yet initialized)
            if (!cancelled) setAdminCheckDone(true);
        };

        checkAdmin();
        return () => { cancelled = true; };
    }, [walletAddress, getAdmin]);

    // ── Fetch Student Directory ─────────────────────────────────────────────
    useEffect(() => {
        const fetchDirectory = async () => {
            if (!walletAddress) return;
            setIsLoadingDirectory(true);
            try {
                const addresses = await getAllStudents();
                const directoryData = await Promise.all(
                    addresses.map(async (addr) => {
                        const profile = await getStudentProfile(addr);
                        return { 
                            address: addr, 
                            name: profile?.name || "Anonymous Student",
                            email: profile?.email || "No Email",
                            profile_pic: profile?.profile_pic || ""
                        };
                    })
                );
                setRegisteredStudents(directoryData);
            } catch (err) {
                console.error("Failed to fetch student directory:", err);
            } finally {
                setIsLoadingDirectory(false);
            }
        };
        fetchDirectory();
    }, [walletAddress, getAllStudents, getStudentProfile]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const hash = await hashFile(file);
            setDocHash(hash);
            setFileName(file.name);
            setStatus({ type: 'success', message: `File hashed: ${file.name}` });
        } catch (err) {
            setStatus({ type: 'error', message: "Failed to hash file." });
        }
    };

    const handleInitialize = async () => {
        if (!walletAddress) return;
        setIsInitializing(true);
        setStatus({ type: 'info', message: "Checking registry status..." });
        try {
            // Always check on-chain first — never blindly call initialize
            const admin = await getAdmin();
            if (admin) {
                setCurrentAdminOnChain(admin);
                setStatus({ type: 'success', message: `Registry already active. Admin: ${truncateAddress(admin)}` });
                return;
            }
            setStatus({ type: 'info', message: "Initializing contract on Stellar..." });
            await initialize(walletAddress);
            setCurrentAdminOnChain(walletAddress);
            setStatus({ type: 'success', message: "Registry initialized successfully!" });
        } catch (err) {
            // If it panics with "already initialized", recover gracefully
            if (err.message?.includes("already initialized") || err.message?.includes("InvalidAction")) {
                const admin = await getAdmin().catch(() => walletAddress);
                setCurrentAdminOnChain(admin || walletAddress);
                setStatus({ type: 'success', message: "Registry is already active!" });
            } else {
                setStatus({ type: 'error', message: err.message || "Initialization failed." });
            }
        } finally {
            setIsInitializing(false);
        }
    };

    const handleFund = async () => {
        setIsFunding(true);
        setStatus({ type: 'info', message: "Requesting Testnet XLM from Friendbot..." });
        try {
            await fundAccount();
            setStatus({ type: 'success', message: "Account funded with Testnet XLM!" });
        } catch (err) {
            setStatus({ type: 'error', message: err.message || "Funding failed." });
        } finally {
            setIsFunding(false);
        }
    };

    const handleIssue = async (e) => {
        e.preventDefault();

        if (!walletAddress) {
            setStatus({ type: 'error', message: "Please connect your wallet first." });
            return;
        }
        if (!studentAddress.trim()) {
            setStatus({ type: 'error', message: "Please enter a student wallet address." });
            return;
        }
        if (!docHash) {
            setStatus({ type: 'error', message: "Please upload a document to hash first." });
            return;
        }
        if (studentAddress.trim() === walletAddress) {
            setStatus({ type: 'error', message: "Student address cannot be the same as the admin address." });
            return;
        }
        if (currentAdminOnChain && walletAddress !== currentAdminOnChain) {
            setStatus({ type: 'error', message: "Unauthorized: Your wallet is not the Master Registrar." });
            return;
        }

        setIsIssuing(true);
        setStatus({ type: 'info', message: "Awaiting Freighter signature..." });

        try {
            // 1. Fetch Student Name for History Display
            const profile = await getStudentProfile(studentAddress.trim());
            const studentLabel = profile?.name || "Anonymous Student";

            setStatus({ type: 'info', message: "Broadcasting to Stellar Ledger... Please wait." });
            const result = await issueCredential(studentAddress.trim(), docHash);

            setStatus({ type: 'success', message: `Credential confirmed! TX: ${result.hash.slice(0, 8)}...` });
            setLiveHistory(prev => [{
                name: studentLabel,
                wallet: truncateAddress(studentAddress.trim()),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: "VERIFIED",
                tx: result.hash.slice(0, 8) + '...',
            }, ...prev]);

            setStudentAddress("");
            setDocHash("");
            setFileName("");
        } catch (err) {
            console.error("Issue error:", err);
            setStatus({ type: 'error', message: err.message || "Failed to issue credential." });
        } finally {
            setIsIssuing(false);
        }
    };

    const isAdmin = !currentAdminOnChain || walletAddress === currentAdminOnChain;
    const showInitButton = walletAddress && adminCheckDone && !currentAdminOnChain;

    return (
        <div className="min-h-screen bg-surface font-body text-on-surface">
            {/* ── Header ── */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
                <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-black tracking-tighter text-blue-900 font-headline">VeracityLink</div>
                    <div className="hidden md:flex items-center gap-8 font-headline text-sm font-semibold tracking-tight">
                        <Link className="text-blue-700 border-b-2 border-blue-700 pb-1" to="/">Dashboard</Link>
                        <Link className="text-slate-600 hover:text-blue-900 transition-colors" to="/profile">Profile</Link>
                        <Link className="text-slate-600 hover:text-blue-900 transition-colors" to="/verify">Verify</Link>
                    </div>
                    <button
                        onClick={walletAddress ? disconnect : connect}
                        disabled={isConnecting}
                        className="px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm active:scale-95 transition-all disabled:opacity-50 font-headline"
                        style={{ background: 'linear-gradient(135deg, #00113a 0%, #758dd5 100%)' }}
                    >
                        {isConnecting ? "Connecting..." : (walletAddress ? `${truncateAddress(walletAddress)} · Disconnect` : "Connect Wallet")}
                    </button>
                </nav>
            </header>

            <div className="pt-24 flex max-w-7xl mx-auto min-h-screen">
                {/* ── Sidebar ── */}
                <aside className="w-64 flex-shrink-0 p-6 space-y-8 border-r border-outline-variant/10 bg-white/50">
                    <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-400 flex items-center justify-center text-white font-black text-sm">
                            {walletAddress ? walletAddress.slice(0, 2) : "VL"}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-primary">Master Registrar</div>
                            <div className="text-[10px] text-on-surface-variant font-medium font-mono">
                                {walletAddress ? truncateAddress(walletAddress) : "Disconnected"}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-2xl space-y-2 border border-primary/10">
                        <div className="text-[10px] font-black uppercase text-primary tracking-widest">Network Status</div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full transition-colors ${!adminCheckDone && walletAddress ? 'bg-yellow-400 animate-pulse' :
                                currentAdminOnChain ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                    'bg-amber-400'
                                }`}></div>
                            <div className="text-[10px] font-bold text-primary">
                                {!adminCheckDone && walletAddress ? 'Checking...' :
                                    currentAdminOnChain ? 'Activated & Live' : 'Not Initialized'}
                            </div>
                        </div>
                        {currentAdminOnChain && (
                            <div className="text-[9px] text-on-surface-variant font-mono break-all opacity-60">
                                ADM: {truncateAddress(currentAdminOnChain)}
                            </div>
                        )}
                        <div className="text-[9px] text-on-surface-variant opacity-40 pt-1">
                            Stellar Testnet
                        </div>
                    </div>
                    {/* Wallet warning if connected wallet isn't admin */}
                    {walletAddress && currentAdminOnChain && walletAddress !== currentAdminOnChain && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <div className="text-[9px] font-black text-red-600 uppercase tracking-wider mb-1">⚠ Not Admin Wallet</div>
                            <div className="text-[9px] text-red-500 leading-tight">
                                Connected wallet is not the Master Registrar. Switch to {truncateAddress(currentAdminOnChain)} to issue credentials.
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-outline-variant/10">
                        <div className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Registry Directory</div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoadingDirectory ? (
                                <div className="text-[10px] text-on-surface-variant italic animate-pulse">Scanning ledger...</div>
                            ) : registeredStudents.length === 0 ? (
                                <div className="text-[10px] text-on-surface-variant italic opacity-50">No students registered yet.</div>
                            ) : (
                                registeredStudents.map((s, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setStudentAddress(s.address)}
                                        className="w-full text-left p-3 rounded-xl bg-white border border-outline-variant/5 hover:border-primary hover:shadow-sm transition-all group flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                            {s.profile_pic ? (
                                                <img src={s.profile_pic} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined text-sm">account_circle</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-primary group-hover:text-blue-700 truncate leading-tight">{s.name}</div>
                                            <div className="text-[9px] text-on-surface-variant opacity-60 truncate leading-tight">{s.email || truncateAddress(s.address)}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* ── Main ── */}
                <main className="flex-grow p-10">
                    <header className="mb-10 flex justify-between items-end text-left">
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">Administrative Portal</div>
                            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-primary">Academic Integrity Registry</h1>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {/* Action buttons — only shown when needed */}
                            {showInitButton && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleFund}
                                        disabled={isFunding}
                                        className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">payments</span>
                                        {isFunding ? "Funding..." : "Get Testnet XLM"}
                                    </button>
                                    <button
                                        onClick={handleInitialize}
                                        disabled={isInitializing}
                                        className="px-4 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                        {isInitializing ? "Checking..." : "Initialize Registry"}
                                    </button>
                                </div>
                            )}

                            {/* Status banner */}
                            {status && (
                                <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    status.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                    {status.type === 'info' && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                                    {status.message}
                                    <button onClick={() => setStatus(null)} className="ml-2 opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
                            <span className="material-symbols-outlined text-primary mb-6 text-3xl">school</span>
                            <div className="text-4xl font-black text-primary mb-1">{1284 + liveHistory.length}</div>
                            <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Issued</div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                            </div>
                            <div className="text-4xl font-black text-primary mb-1">98.2%</div>
                            <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Verification Rate</div>
                        </div>
                        <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-blue-600 text-lg">history</span>
                            </div>
                            <div className="text-4xl font-black text-primary mb-1">2.4s</div>
                            <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Avg Confirmation</div>
                        </div>
                    </div>

                    {/* ── Issue form + History table ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Issue form */}
                        <div className="lg:col-span-12 xl:col-span-5 bg-white p-8 rounded-[2.5rem] shadow-xl border border-outline-variant/10">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="material-symbols-outlined text-primary">assignment_add</span>
                                <h3 className="font-headline font-bold text-xl text-primary">Issue New Credential</h3>
                            </div>

                            <form className="space-y-6" onSubmit={handleIssue}>
                                <div className="space-y-4 text-left">

                                    {/* File upload */}
                                    <div className="relative">
                                        <div className={`p-8 border-2 border-dashed rounded-2xl text-center group transition-all cursor-pointer relative
                                            ${docHash ? 'border-emerald-400 bg-emerald-50' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary'}`}>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                onChange={handleFileChange}
                                            />
                                            {docHash ? (
                                                <>
                                                    <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">check_circle</span>
                                                    <div className="text-xs font-bold text-emerald-700">{fileName}</div>
                                                    <div className="text-[9px] text-emerald-500 font-mono mt-1">Hash ready</div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary mb-2 transition-colors">cloud_upload</span>
                                                    <div className="text-xs font-bold text-on-surface-variant">Drag or Click to Hash Document</div>
                                                    <div className="text-[9px] text-on-surface-variant/60 mt-1">PDF, JPG, PNG, DOCX — any file</div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Student address */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                                            Student Wallet Address
                                        </label>
                                        <input
                                            className="w-full bg-surface-container-low px-4 py-3 rounded-lg text-xs font-mono border border-transparent focus:border-primary focus:outline-none transition-colors"
                                            placeholder="G..."
                                            value={studentAddress}
                                            onChange={(e) => setStudentAddress(e.target.value)}
                                        />
                                        {studentAddress && studentAddress === walletAddress && (
                                            <div className="text-[9px] text-red-500 font-bold">
                                                ⚠ Cannot issue to your own address
                                            </div>
                                        )}
                                    </div>

                                    {/* Hash display */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                                            Cryptographic Proof (SHA-256)
                                        </label>
                                        <input
                                            className="w-full bg-surface-container-high px-4 py-3 rounded-lg text-[10px] font-mono text-primary border border-transparent"
                                            placeholder="Upload a document to generate hash..."
                                            readOnly
                                            value={docHash}
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all font-headline flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={isIssuing || !walletAddress || !isAdmin}
                                    type="submit"
                                >
                                    {isIssuing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : "Commit to Stellar"}
                                </button>

                                {/* Not-admin warning */}
                                {walletAddress && currentAdminOnChain && walletAddress !== currentAdminOnChain && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-[9px] font-bold leading-tight border border-red-100">
                                        ⚠ Connected wallet ({truncateAddress(walletAddress)}) is not the Master Registrar ({truncateAddress(currentAdminOnChain)}). Switch wallets to issue.
                                    </div>
                                )}

                                {/* Not connected */}
                                {!walletAddress && (
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold leading-tight border border-blue-100 text-center">
                                        Connect your wallet to issue credentials
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* History table */}
                        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                                <h3 className="font-headline font-bold text-sm text-primary">Issuance History</h3>
                                <div className="text-[10px] text-on-surface-variant font-mono">{displayHistory.length} records</div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Tx Hash</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-medium text-primary divide-y divide-outline-variant/5">
                                    {displayHistory.map((row, i) => (
                                        <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-sm">{row.name}</div>
                                                <div className="text-[10px] text-on-surface-variant font-mono">{row.wallet}</div>
                                            </td>
                                            <td className="px-6 py-5 text-[11px] text-on-surface-variant">{row.date}</td>
                                            <td className="px-6 py-5 text-on-surface-variant font-mono text-[10px]">{row.tx}</td>
                                            <td className="px-6 py-5">
                                                <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UniversityAdminDashboard;