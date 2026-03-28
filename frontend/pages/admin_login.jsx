import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Skip actual auth for now as requested for testing
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 -z-10 opacity-30">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="w-full max-w-md space-y-12">
                <div className="text-center space-y-4">
                    <div className="text-4xl font-black tracking-tighter text-primary font-headline">VeracityLink</div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-on-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">shield</span>
                        Secure Gateway
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-outline-variant/10 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[2.5rem] pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black font-headline text-primary tracking-tight">Institutional Login</h2>
                            <p className="text-sm text-on-surface-variant font-medium">Access the academic integrity registry.</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Administrative ID</label>
                                    <div className="relative">
                                        <input className="w-full bg-surface-container-low px-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium" placeholder="ID-482-991" required type="text" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">badge</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">Access Key</label>
                                    <div className="relative">
                                        <input className="w-full bg-surface-container-low px-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium" placeholder="••••••••" required type="password" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3" type="submit">
                                Verify & Enter
                                <span className="material-symbols-outlined">login</span>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-outline px-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00875a] animate-pulse"></span>
                        Stellar Mainnet Active
                    </div>
                    <a className="hover:text-primary transition-colors" href="#">Recovery</a>
                </div>
            </div>

            <footer className="absolute bottom-10 text-[10px] font-bold text-outline uppercase tracking-widest">
                © 2024 VeracityLink. Institutional Access Only.
            </footer>
        </div>
    );
};

export default AdminLogin;
