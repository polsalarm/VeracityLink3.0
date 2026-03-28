import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { hashString } from '../utils/hashing';

const RegistrationPage = () => {
    const { 
        walletAddress, connect, disconnect, isConnecting, truncateAddress, 
        registerStudent, getStudentProfile 
    } = useWallet();
    
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [universityId, setUniversityId] = useState("");
    const [profilePic, setProfilePic] = useState(""); 
    const [isRegistering, setIsRegistering] = useState(false);
    const [regStatus, setRegStatus] = useState(null);
    const [step, setStep] = useState(1);

    // Redirect if already registered
    useEffect(() => {
        const checkReg = async () => {
            if (walletAddress) {
                const profile = await getStudentProfile(walletAddress);
                if (profile) navigate('/profile');
            }
        };
        checkReg();
    }, [walletAddress, getStudentProfile, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 64000) { // Keep under 64KB for Soroban
                setRegStatus({ type: 'error', message: "Image too large. Stellar Network limit is 128KB (including transaction overhead). Please use a small thumbnail (<64KB)." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setProfilePic(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFinalize = async (e) => {
        e.preventDefault();
        if (!name || !email || !universityId) {
            setRegStatus({ type: 'error', message: "Please fill all fields." });
            return;
        }

        setIsRegistering(true);
        setRegStatus({ type: 'info', message: "Hashing Identity & Preparing Transaction..." });

        try {
            // 1. Hash the University ID for privacy
            const idHash = await hashString(universityId.trim());
            console.log("Hashed ID:", idHash);

            // 2. Submit to Stellar
            setRegStatus({ type: 'info', message: "Sign with Freighter to anchor identity..." });
            await registerStudent(name.trim(), email.trim(), idHash, profilePic);
            
            setRegStatus({ type: 'success', message: "Registration Confirmed! Moving to your profile..." });
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            console.error("Registration failed:", err);
            setRegStatus({ type: 'error', message: err.message || "Registration failed. Please try again." });
        } finally {
            setIsRegistering(false);
        }
    };

    if (!walletAddress) {
        return (
            <div className="min-h-screen academic-gradient flex items-center justify-center p-6 text-white text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                    <h1 className="text-5xl font-black font-headline tracking-tighter">VeracityLink</h1>
                    <p className="text-blue-100 text-lg">Connect your wallet to begin your academic identity registration.</p>
                    <button 
                        onClick={connect}
                        disabled={isConnecting}
                        className="w-full bg-white text-blue-900 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                    >
                        {isConnecting ? "Connecting..." : "Connect Freighter Wallet"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-body text-slate-900">
            {/* Design styles from user */}
            <style dangerouslySetInnerHTML={{ __html: `
                .academic-gradient { background: linear-gradient(135deg, #00113a 0%, #758dd5 100%); }
                .glass-panel { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); }
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
            `}} />

            {/* Top Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-black tracking-tighter text-blue-900 font-headline">VeracityLink</div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="font-mono text-xs text-slate-600">{truncateAddress(walletAddress)}</span>
                        </div>
                        <button onClick={disconnect} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">Disconnect</button>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
                <div className="flex-1 max-w-4xl">
                    <header className="mb-12">
                        <h1 className="font-headline text-5xl font-extrabold text-[#00113a] mb-2 leading-tight tracking-tighter">
                            Identity Registration
                        </h1>
                        <p className="text-slate-500 max-w-xl text-lg">
                            Secure your academic legacy on the Stellar blockchain. Establish your
                            decentralized identity in three definitive steps.
                        </p>
                    </header>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-[#758dd5]' : 'bg-slate-200'} transition-all duration-500`} />
                        <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-[#758dd5]' : 'bg-slate-200'} transition-all duration-500`} />
                        <div className={`flex-1 h-1.5 rounded-full ${step >= 3 ? 'bg-[#758dd5]' : 'bg-slate-200'} transition-all duration-500`} />
                    </div>

                    <div className="grid grid-cols-1 gap-12 mb-16">
                        {/* Step 1: Profile Type */}
                        <section className={`transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                            <h2 className="font-headline text-2xl font-bold text-[#00113a] mb-6 flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full ${step === 1 ? 'bg-[#00113a] text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-sm font-black`}>1</span>
                                Choose Profile Type
                            </h2>
                            <div className="max-w-md">
                                <div onClick={() => setStep(2)} className="group relative p-8 rounded-3xl bg-white border-2 border-[#758dd5] shadow-[0_20px_50px_rgba(117,141,213,0.15)] transition-all cursor-pointer">
                                    <div className="mb-6 w-14 h-14 rounded-2xl bg-[#758dd5]/10 flex items-center justify-center text-[#758dd5]">
                                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                                    </div>
                                    <h3 className="font-headline text-xl font-bold mb-2">Student Profile</h3>
                                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                        For individuals looking to store, verify, and share their
                                        academic transcripts and certifications securely.
                                    </p>
                                    <div className="flex items-center gap-2 text-[#758dd5] font-black text-xs uppercase tracking-widest">
                                        Selected Academic Role <span className="material-symbols-outlined text-sm">check_circle</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Step 2: Identity Details */}
                        <section className={`transition-all duration-500 ${step === 2 ? 'opacity-100 scale-100' : 'opacity-40 grayscale blur-[2px] pointer-events-none scale-95'}`}>
                            <h2 className="font-headline text-2xl font-bold text-[#00113a] mb-6 flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full ${step === 2 ? 'bg-[#00113a] text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-sm font-black`}>2</span>
                                Identity Verification
                            </h2>
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 space-y-8">
                                {/* Avatar Upload Section */}
                                <div className="flex flex-col items-center gap-6 pb-6 border-b border-slate-50">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center shadow-inner relative z-10 transition-transform group-hover:scale-105">
                                            {profilePic ? (
                                                <img src={profilePic} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-slate-300">account_circle</span>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#00113a] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-90 transition-all z-20">
                                            <span className="material-symbols-outlined text-lg">photo_camera</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-headline font-bold text-slate-900">Upload Profile Photo</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1 italic">Max 64KB (Stellar Network Constraint)</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Full Legal Name</label>
                                        <input 
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-[#758dd5] focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                            placeholder="e.g. Julian Sterling"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); if(e.target.value) setRegStatus(null); }}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Academic Email</label>
                                        <input 
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-[#758dd5] focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                            placeholder="j.sterling@university.edu"
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); if(e.target.value) setRegStatus(null); }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">University ID (Confidential)</label>
                                    <div className="relative">
                                        <input 
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-[#758dd5] focus:bg-white focus:outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                            placeholder="UID-8829-XLC"
                                            value={universityId}
                                            onChange={(e) => { setUniversityId(e.target.value); if(e.target.value) setRegStatus(null); }}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#758dd5] flex items-center gap-2">
                                            <span className="text-xs font-black tracking-widest opacity-50 uppercase">SHA-256 Hashing Active</span>
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">This ID is hashed locally before being anchored to the Stellar network. Your raw ID never leaves your device.</p>
                                </div>
                                <button 
                                    onClick={() => (name && email && universityId) ? setStep(3) : setRegStatus({type:'error', message:'Fill all fields to continue'})}
                                    className="px-8 py-3 bg-[#00113a] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Proceed to Review
                                </button>
                            </div>
                        </section>

                        {/* Step 3: Review & Sign */}
                        <section className={`transition-all duration-500 ${step === 3 ? 'opacity-100 scale-100' : 'opacity-40 grayscale blur-[2px] pointer-events-none scale-95'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                                <div className="md:col-span-12 lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <h2 className="font-headline text-2xl font-bold text-[#00113a] mb-6 flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-full ${step === 3 ? 'bg-[#00113a] text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-sm font-black`}>3</span>
                                            Review Profile
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Photo</span>
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white">
                                                    {profilePic ? (
                                                        <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <span className="material-symbols-outlined text-sm">account_circle</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Name</span>
                                                <span className="text-sm font-bold text-[#00113a]">{name || "Not set"}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Email</span>
                                                <span className="text-sm font-bold text-[#00113a]">{email || "Not set"}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 rounded-2xl bg-blue-50/50">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet</span>
                                                <span className="text-[11px] font-mono text-blue-700">{truncateAddress(walletAddress)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
                                        <span className="material-symbols-outlined text-[#758dd5]">contact_support</span>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">Once signed, these details (excluding your raw ID) become part of your public verifiable record on Stellar.</p>
                                    </div>
                                </div>

                                <div className="md:col-span-12 lg:col-span-6">
                                    <div className="relative p-8 rounded-3xl bg-[#00113a] text-white overflow-hidden h-full min-h-[300px] flex flex-col justify-center border-l-[12px] border-[#758dd5] shadow-2xl">
                                        <div className="absolute top-[-40px] right-[-40px] opacity-10">
                                            <span className="material-symbols-outlined text-[200px]">fingerprint</span>
                                        </div>
                                        <div className="relative z-10 space-y-6">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.4em] font-black mb-4 opacity-50">Blockchain Anchor Prep</p>
                                                <div className="flex items-center gap-3 bg-white/10 text-blue-200 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                                                    <span className="material-symbols-outlined text-sm">key</span>
                                                    <span className="text-[10px] font-mono tracking-tighter truncate w-full">
                                                        SHA256: 8f2b3c1d9e5a7f0c... {universityId ? "(Hashed Local)" : "Awaiting Data"}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-blue-100/60 leading-relaxed italic">
                                                By clicking finalize, you will sign a transaction on the Stellar
                                                Network to anchor your profile data permanently and immutably.
                                            </p>

                                            <button 
                                                onClick={handleFinalize}
                                                disabled={isRegistering}
                                                className="w-full bg-[#758dd5] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-blue-900 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                                            >
                                                {isRegistering ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <>Finalize Registration <span className="material-symbols-outlined">rocket_launch</span></>
                                                )}
                                            </button>
                                            {regStatus && (
                                                <div className={`text-center p-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${regStatus.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-blue-500/20 text-blue-200'}`}>
                                                    {regStatus.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                        <div className="flex items-start gap-5">
                            <span className="material-symbols-outlined text-[#758dd5] text-4xl">security</span>
                            <div>
                                <p className="font-headline font-bold text-[#00113a] text-xl">Identity Privacy Protection</p>
                                <p className="text-sm text-slate-500">Your raw University ID never touches the blockchain. We only store the proof of its existence.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full bg-slate-900 mt-20">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto gap-8">
                    <div className="space-y-2">
                        <div className="font-headline font-bold text-white text-2xl">VeracityLink</div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 italic">© 2024 VeracityLink. Academic Integrity Securely Anchored.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <a href="#" className="hover:text-white transition-colors">Network Status</a>
                            <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default RegistrationPage;
