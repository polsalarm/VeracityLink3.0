import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

const LandingPage = () => {
    const { walletAddress, connect, disconnect, isConnecting, truncateAddress, error } = useWallet();

    return (
        <div className="bg-surface font-body text-on-surface">
            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .text-gradient {
                    background: linear-gradient(135deg, #00113a 0%, #758dd5 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .button-gradient {
                    background: linear-gradient(135deg, #00113a 0%, #758dd5 100%);
                }
                .hash-anchor {
                    backdrop-filter: blur(8px);
                }
            `}} />

            {/* Wallet Error Toast */}
            {error && (
                <div className="fixed bottom-10 right-10 z-[100] bg-error-container text-on-error-container p-4 rounded-xl shadow-2xl border border-error animate-bounce">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">warning</span>
                        <span className="text-sm font-bold tracking-tight">{error}</span>
                    </div>
                </div>
            )}

            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-black tracking-tighter text-blue-900 dark:text-white font-headline">
                        VeracityLink
                    </div>
                    <div className="hidden md:flex items-center space-x-8 font-headline text-sm font-semibold tracking-tight">
                        <Link className="text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 pb-1" to="/">Dashboard</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-900 transition-colors" to="/profile">Profile</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-900 transition-colors" to="/verify">Verify</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block text-slate-600 font-headline text-sm font-semibold hover:text-blue-900 transition-colors px-4 py-2">Login</Link>
                        <button 
                            onClick={walletAddress ? disconnect : connect}
                            disabled={isConnecting}
                            className="button-gradient text-white px-6 py-2.5 rounded-lg font-headline text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isConnecting ? "Connecting..." : (walletAddress && typeof walletAddress === 'string' ? "Disconnect" : "Connect Wallet")}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-24 overflow-hidden">
                {/* Hero Section */}
                <section className="relative px-6 pt-16 pb-24 md:pt-32 md:pb-48 max-w-7xl mx-auto bg-white/30 rounded-[4rem] my-10 border border-white/40 shadow-xl backdrop-blur-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container border border-on-tertiary-container/20">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                <span className="text-xs font-bold tracking-widest uppercase font-label">Stellar Network Powered</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-tight tracking-tighter text-on-background">
                                The Future of <br />
                                <span className="text-gradient">Academic Trust.</span>
                            </h1>
                            <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-medium">
                                VeracityLink establishes a permanent, secure, and decentralized lineage for academic truth by anchoring cryptographic proofs of scholarly achievements to the Stellar ledger.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/verify" className="button-gradient text-white px-8 py-4 rounded-lg font-headline font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                                    Verify Now <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                                <button className="bg-surface-container-lowest border border-outline-variant/30 text-primary px-8 py-4 rounded-lg font-headline font-bold text-lg hover:bg-surface-container-low transition-all active:scale-95">
                                    Register Institution
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative">
                            <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl border border-outline-variant/10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shadow-inner">
                                            <span className="material-symbols-outlined text-primary text-2xl">school</span>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-on-surface-variant font-label uppercase tracking-[0.2em]">Digital Diploma</div>
                                            <div className="font-headline font-black text-primary text-xl">Bachelor of CS</div>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Verified</div>
                                </div>
                                <div className="space-y-6">
                                    <div className="h-44 rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
                                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop" alt="University Campus" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-outline uppercase tracking-widest">Cryptographic Hash</div>
                                        <div className="font-mono text-[10px] bg-slate-50 p-4 rounded-xl text-primary/70 break-all border border-slate-100 group hover:border-primary transition-colors cursor-default">
                                            GAVX...K7N2...9QWL...M9R4...Z3B8
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-16 -right-16 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-secondary/10 rounded-full blur-[80px] -z-10"></div>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Section */}
                <section className="bg-surface-container-low py-32 border-y border-slate-100 dark:border-slate-900">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-5xl font-black font-headline tracking-tighter text-primary">Built for the Ecosystem.</h2>
                            <p className="text-on-surface-variant font-medium text-lg max-w-2xl mx-auto">One decentralized ledger, three distinct experiences tailored for success.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Universities */}
                            <div className="group bg-white p-10 rounded-[3rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl transition-all duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
                                </div>
                                <h3 className="text-3xl font-black font-headline mb-4 text-primary">Universities</h3>
                                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6">Action: Issue</div>
                                <p className="text-on-surface-variant mb-8 leading-relaxed font-medium">Digitally sign and anchor academic records to the blockchain with a single hash. Automate the issuance workflow.</p>
                                <ul className="space-y-4 text-sm font-bold text-primary">
                                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-emerald-500">verified</span> Batch processing</li>
                                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-emerald-500">verified</span> Custom metadata</li>
                                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-emerald-500">verified</span> Revocation control</li>
                                </ul>
                            </div>

                            {/* Students */}
                            <div className="group bg-[#00113a] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-white text-4xl">person</span>
                                    </div>
                                    <h3 className="text-3xl font-black font-headline mb-4">Students</h3>
                                    <div className="text-xs font-black text-secondary uppercase tracking-widest mb-6">Action: Own</div>
                                    <p className="text-white/70 mb-8 leading-relaxed font-medium">Take full ownership of your credentials. Share secure, time-limited links with employers or graduate schools.</p>
                                    <ul className="space-y-4 text-sm font-bold">
                                        <li className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary">verified</span> Portable wallet</li>
                                        <li className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary">verified</span> Privacy controls</li>
                                        <li className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary">verified</span> Global accessibility</li>
                                    </ul>
                                </div>
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-secondary/40 to-transparent -z-0"></div>
                            </div>

                            {/* Employers */}
                            <div className="group bg-white p-10 rounded-[3rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl transition-all duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-secondary text-4xl">fact_check</span>
                                </div>
                                <h3 className="text-3xl font-black font-headline mb-4 text-primary">Employers</h3>
                                <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6">Action: Verify</div>
                                <p className="text-on-surface-variant mb-8 leading-relaxed font-medium">Instant, zero-cost verification of applicant history. Eliminate background check friction and fraud risk.</p>
                                <ul className="space-y-4 text-sm font-bold text-primary">
                                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500">verified</span> Real-time validation</li>
                                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500">verified</span> Tamper-proof logs</li>
                                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-500">verified</span> API integration</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="px-6 py-32">
                    <div className="max-w-6xl mx-auto relative rounded-[4rem] overflow-hidden p-16 md:p-32 text-center bg-[#00113a] shadow-3xl">
                        <img className="absolute inset-0 w-full h-full object-cover opacity-20 z-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAnMlOugYzKdPAVq1UGVny3Wrtab02e30ZYXxwCq5qiVS8dqu3GHSkVVbGK7dZCYSzdJx4hnK0CnGwugjd8tNfcum_RwdRK_RIxpsWnLspkO1eJNBee8w6DEDIX3io7Msq9p7HGj3uI5PKliMiL91dlQhnBFf7if2-1y-K42ubJGtAWk9N46L1qKhkuh3C8tK-GC9eYNHE9j8zfVECIahqGG9vPnphdpMjx6uLkaeiM5bxhKSZSoQPr7SZBcA_6-susXNm2krkv5PI" alt="Network Background" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00113a] via-transparent to-transparent opacity-60"></div>
                        <div className="relative z-10 space-y-12">
                            <h2 className="text-4xl md:text-8xl font-black font-headline text-white tracking-tighter leading-none">Ready to link <br />the future?</h2>
                            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed">
                                Join the next generation of academic integrity. Establish your institution's permanent lineage on the Stellar network today.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <button 
                                    onClick={walletAddress ? disconnect : connect}
                                    disabled={isConnecting}
                                    className="bg-white text-primary px-12 py-6 rounded-2xl font-headline font-black text-xl shadow-2xl hover:bg-slate-50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isConnecting ? "Connecting..." : (walletAddress && typeof walletAddress === 'string' ? "Disconnect" : "Connect Wallet")}
                                </button>
                                <Link to="/docs" className="bg-white/10 backdrop-blur-md text-white border-2 border-white/20 px-12 py-6 rounded-2xl font-headline font-black text-xl hover:bg-white/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center">Documentation</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full bg-slate-50 dark:bg-slate-950 border-t-0 mt-20">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto gap-4">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="font-manrope font-bold text-slate-900 dark:text-white text-lg">
                            VeracityLink
                        </div>
                        <p className="font-inter text-xs uppercase tracking-widest text-slate-500">
                            © 2026 VeracityLink. Powered by Stellar.
                        </p>
                    </div>
                    <div className="flex gap-8">
                        <Link className="font-inter text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-4 transition-opacity duration-300" to="/docs">Network Status</Link>
                        <Link className="font-inter text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-4 transition-opacity duration-300" to="/docs">Documentation</Link>
                        <Link className="font-inter text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-4 transition-opacity duration-300" to="/docs">Privacy Policy</Link>
                        <Link className="font-inter text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-4 transition-opacity duration-300" to="/docs">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
