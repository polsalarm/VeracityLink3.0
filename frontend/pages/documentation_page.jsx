import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

const DocumentationPage = () => {
    const { truncateAddress } = useWallet();
    const [activeSection, setActiveSection] = React.useState('overview');

    // Use Intersection Observer to highlight sidebar links as you scroll
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '-10% 0px -70% 0px' }
        );

        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => observer.observe(section));

        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);

    const sidebarLinkClass = (id) => `
        sidebar-link flex items-center space-x-3 px-4 py-3 rounded-r-full transition-all duration-300
        ${activeSection === id
            ? 'text-[#4b41e1] bg-white font-bold shadow-sm translate-x-1'
            : 'text-[#444650] dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}
    `;

    return (
        <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#00113a] font-body text-slate-900 overflow-x-hidden flex">
            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    display: inline-block;
                    vertical-align: middle;
                }
                .code-block {
                    background-color: #00113a;
                    color: #e2dfff;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    font-family: monospace;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    overflow-x: auto;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .hash-anchor {
                    font-family: monospace;
                    background-color: #002f29;
                    color: #62fae3;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    backdrop-filter: blur(4px);
                    font-weight: bold;
                }
                .sidebar-link {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                section { scroll-margin-top: 6rem; }
            `}} />

            {/* Google Fonts & Icons */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* TopNavBar */}
            <nav className="flex justify-between items-center px-8 h-20 w-full fixed top-0 z-50 bg-[#f7f9fb]/90 dark:bg-[#00113a]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                <Link to="/" className="text-2xl font-black text-[#00113a] dark:text-white font-headline tracking-tighter">
                    VeracityLink
                </Link>
                <div className="flex items-center">
                    <Link
                        to="/"
                        className="bg-[#00113a] dark:bg-white text-white dark:text-[#00113a] px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Landing Page
                    </Link>
                </div>
            </nav>

            {/* SideNavBar */}
            <aside className="fixed left-0 top-20 bottom-0 w-64 pt-10 pb-6 flex flex-col bg-[#f2f4f6] dark:bg-[#00113a]/95 border-r border-slate-200 dark:border-white/5 z-40">
                <div className="px-8 mb-10">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#00113a] dark:text-white mb-1">Documentation</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v1.3.2-stable</p>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <a className={sidebarLinkClass('overview')} href="#overview">
                        <span className="material-symbols-outlined text-[20px]">menu_book</span>
                        <span className="text-sm">Overview</span>
                    </a>
                    <a className={sidebarLinkClass('roles')} href="#roles">
                        <span className="material-symbols-outlined text-[20px]">groups</span>
                        <span className="text-sm">Ecosystem Roles</span>
                    </a>
                    <a className={sidebarLinkClass('quickstart')} href="#quickstart">
                        <span className="material-symbols-outlined text-[20px]">bolt</span>
                        <span className="text-sm">Quickstart</span>
                    </a>
                    <a className={sidebarLinkClass('api')} href="#api">
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                        <span className="text-sm">Contract API</span>
                    </a>
                    <a className={sidebarLinkClass('data-model')} href="#data-model">
                        <span className="material-symbols-outlined text-[20px]">database</span>
                        <span className="text-sm">Core Data Model</span>
                    </a>
                    <a className={sidebarLinkClass('security')} href="#security">
                        <span className="material-symbols-outlined text-[20px]">verified_user</span>
                        <span className="text-sm">Security & Privacy</span>
                    </a>
                    <a className={sidebarLinkClass('tech-stack')} href="#tech-stack">
                        <span className="material-symbols-outlined text-[20px]">layers</span>
                        <span className="text-sm">Tech Stack</span>
                    </a>
                </nav>
                <div className="px-6 mt-auto">
                    <a href="https://github.com/polsalarm/VeracityLink3.0.git" target="_blank" rel="noreferrer" className="block text-center w-full py-3 bg-[#00113a] dark:bg-white text-white dark:text-[#00113a] text-xs font-black rounded-xl uppercase tracking-widest hover:shadow-xl transition-all">
                        View Github
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-64 w-full">
                <main className="pt-32 pb-24 px-16 max-w-6xl mx-auto">
                    {/* Hero / Header Section */}
                    <section className="mb-24 animate-in fade-in slide-in-from-bottom duration-700" id="overview">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="hash-anchor">VERACITY_AUTH_v1.3.2</span>
                            <span className="text-blue-900 dark:text-blue-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                                Soroban Secure Protocol
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-headline font-black text-[#00113a] dark:text-white mb-8 leading-[0.9] tracking-tighter">
                            The Ledger of <br />
                            <span className="text-[#4b41e1] dark:text-blue-400">Academic Truth.</span>
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
                            <div className="bg-slate-100 dark:bg-white/5 p-10 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                                <h3 className="font-headline font-black text-2xl mb-6 text-[#00113a] dark:text-white">
                                    The Legacy Problem
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Traditional academic verification processes are plagued by administrative delays and manual processing. Paper-based systems are vulnerable to forgery and lack a central, immutable source of truth for scholarly achievements.
                                </p>
                            </div>
                            <div className="bg-[#4b41e1] text-white p-10 rounded-3xl shadow-2xl shadow-blue-900/40 transform md:translate-y-12">
                                <h3 className="font-headline font-black text-2xl mb-6 text-white">
                                    The VeracityLink Solution
                                </h3>
                                <p className="leading-relaxed font-medium text-blue-50/90 font-semibold">
                                    VeracityLink anchors cryptographic proofs of scholarly achievements to the Stellar ledger. By eliminating administrative friction and risk of forgery, we establish a permanent, secure, and decentralized lineage for academic truth globally.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Ecosystem Roles Section */}
                    <section className="mb-24" id="roles">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-1.5 bg-[#4b41e1] rounded-full" />
                            <h2 className="text-4xl font-headline font-black text-[#00113a] dark:text-white tracking-tight">
                                Ecosystem Roles
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                            {/* University Card */}
                            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-[#4b41e1] text-4xl mb-6">school</span>
                                <h4 className="font-black font-headline text-xl text-[#00113a] dark:text-white mb-3">University</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">The Master Registrar</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    The authority that initializes the smart contract and manages the registry. They are the only ones capable of issuing and revoking academic credentials.
                                </p>
                            </div>
                            {/* Student Card */}
                            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-[#4b41e1] text-4xl mb-6">workspace_premium</span>
                                <h4 className="font-black font-headline text-xl text-[#00113a] dark:text-white mb-3">Student</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">The Identity Owner</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Maintains their digital profile and secure hashes on the ledger. They provide their document hashes to external parties for high-fidelity verification.
                                </p>
                            </div>
                            {/* Employer Card */}
                            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-[#4b41e1] text-4xl mb-6">search_check</span>
                                <h4 className="font-black font-headline text-xl text-[#00113a] dark:text-white mb-3">Employer</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">The Data Verifier</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    The end-user who utilizes the Verification Portal to cross-reference academic claims against the immutable Stellar ledger in seconds.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Step-by-Step Guide (New Quickstart) */}
                    <section className="mb-24" id="quickstart">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-1.5 bg-[#4b41e1] rounded-full" />
                            <h2 className="text-4xl font-headline font-black text-[#00113a] dark:text-white tracking-tight">
                                Step-by-Step Guide
                            </h2>
                        </div>

                        <div className="space-y-16">
                            {/* Step 1 */}
                            <div className="relative pl-12 border-l border-slate-200 dark:border-white/10">
                                <div className="absolute top-0 -left-6 w-12 h-12 rounded-full bg-white dark:bg-[#00113a] border-4 border-[#4b41e1] flex items-center justify-center font-black text-xl text-[#4b41e1] shadow-lg">1</div>
                                <h4 className="font-black font-headline text-2xl mb-4 dark:text-white">Set Up Your Environment</h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Install prerequisites for Stellar Soroban development.</p>
                                <div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rust & WASM Target</div>
                                        <pre className="code-block">rustup target add wasm32-unknown-unknown</pre>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stellar CLI</div>
                                        <pre className="code-block">cargo install --locked stellar-cli --features opt</pre>
                                    </div>
                                    <p className="text-sm font-bold text-[#4b41e1] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        Install Freighter Wallet and set network to Testnet.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative pl-12 border-l border-slate-200 dark:border-white/10">
                                <div className="absolute top-0 -left-6 w-12 h-12 rounded-full bg-white dark:bg-[#00113a] border-4 border-[#4b41e1] flex items-center justify-center font-black text-xl text-[#4b41e1] shadow-lg">2</div>
                                <h4 className="font-black font-headline text-2xl mb-4 dark:text-white">Initialize Project</h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Clone the VeracityLink core or facilitator provided repository.</p>
                                <pre className="code-block">git clone {"<facitilator-provided-repo-link>"}{"\n"}cd veracity-link-contract</pre>
                            </div>

                            {/* Step 3 */}
                            <div className="relative pl-12 border-l border-slate-200 dark:border-white/10">
                                <div className="absolute top-0 -left-6 w-12 h-12 rounded-full bg-white dark:bg-[#00113a] border-4 border-[#4b41e1] flex items-center justify-center font-black text-xl text-[#4b41e1] shadow-lg">3</div>
                                <h4 className="font-black font-headline text-2xl mb-4 dark:text-white">Logic Implementation</h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Complete the contract logic in src/lib.rs and run unit tests.</p>
                                <pre className="code-block">cargo test</pre>
                            </div>

                            {/* Step 4 */}
                            <div className="relative pl-12 border-l border-slate-200 dark:border-white/10">
                                <div className="absolute top-0 -left-6 w-12 h-12 rounded-full bg-white dark:bg-[#00113a] border-4 border-[#4b41e1] flex items-center justify-center font-black text-xl text-[#4b41e1] shadow-lg">4</div>
                                <h4 className="font-black font-headline text-2xl mb-4 dark:text-white">Deploy to Testnet</h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Generate keys, fund your account, and deploy the WASM.</p>
                                <div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-slate-200 dark:border-white/5 space-y-6">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Generate & Fund Key</div>
                                        <pre className="code-block">stellar keys generate --global my-key --network testnet{"\n"}stellar keys fund my-key --network testnet</pre>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Build WASM</div>
                                        <pre className="code-block">cargo build --target wasm32-unknown-unknown --release</pre>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Deploy</div>
                                        <pre className="code-block">stellar contract deploy \{"\n"}  --wasm target/wasm32-unknown-unknown/release/veracity_link.wasm \{"\n"}  --source my-key \{"\n"}  --network testnet</pre>
                                    </div>
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            Verify on Stellar Expert after deployment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contract API */}
                    <section className="mb-24" id="api">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-1.5 bg-[#4b41e1] rounded-full" />
                            <h2 className="text-4xl font-headline font-black text-[#00113a] dark:text-white tracking-tight">
                                Contract API Reference
                            </h2>
                        </div>
                        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm bg-white dark:bg-white/5">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-8 py-5 font-headline text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Function</th>
                                        <th className="px-8 py-5 font-headline text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Parameters</th>
                                        <th className="px-8 py-5 font-headline text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Storage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6 font-mono text-sm text-[#4b41e1] dark:text-blue-400 font-bold">initialize</td>
                                        <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 italic font-medium">admin: Address</td>
                                        <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-300 font-medium font-mono text-xs">Instance</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6 font-mono text-sm text-[#4b41e1] dark:text-blue-400 font-bold">register_student</td>
                                        <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold break-all">student: Adr, name: Str, id_hash: B32</td>
                                        <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-300 font-medium font-mono text-xs">Persistent</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6 font-mono text-sm text-[#4b41e1] dark:text-blue-400 font-bold">issue_credential</td>
                                        <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 italic font-medium">student: Adr, doc_hash: B32</td>
                                        <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-300 font-medium font-mono text-xs">Persistent</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6 font-mono text-sm text-[#4b41e1] dark:text-blue-400 font-bold">verify_credential</td>
                                        <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 italic font-medium">student: Adr, doc_hash: B32</td>
                                        <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-300 font-medium font-mono text-xs">View Only</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Data Model */}
                    <section className="mb-24" id="data-model">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-1.5 bg-[#4b41e1] rounded-full" />
                            <h2 className="text-4xl font-headline font-black text-[#00113a] dark:text-white tracking-tight">
                                Core Data Model
                            </h2>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
                            <div className="relative bg-white dark:bg-white/5 p-12 rounded-[2rem] border border-slate-200 dark:border-white/5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Rust Protocol Structure</p>
                                <pre className="code-block">
                                    #[contracttype]{"\n"}
                                    pub struct StudentProfile {"{"}{"\n"}
                                    {"    "}pub name: String,{"\n"}
                                    {"    "}pub email: String,{"\n"}
                                    {"    "}pub id_hash: BytesN&lt;32&gt;, // SHA-256 of Gov ID{"\n"}
                                    {"    "}pub profile_pic: String, // IPFS Hash or URL{"\n"}
                                    {"}"}{"\n\n"}
                                    #[contracttype]{"\n"}
                                    pub struct Credential {"{"}{"\n"}
                                    {"    "}pub doc_hash: BytesN&lt;32&gt;, // Degree Metadata Hash{"\n"}
                                    {"    "}pub is_valid: bool,{"\n"}
                                    {"}"}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="mb-24" id="security">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-1.5 bg-emerald-500 rounded-full" />
                            <h2 className="text-4xl font-headline font-black text-[#00113a] dark:text-white tracking-tight">
                                Security & Privacy
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                                <span className="material-symbols-outlined text-emerald-600 text-4xl mb-6">shield</span>
                                <h4 className="font-headline font-black text-xl text-emerald-900 dark:text-emerald-400 mb-4">Privacy-First Hashing</h4>
                                <p className="text-sm text-emerald-800/70 dark:text-emerald-200/60 leading-relaxed font-semibold">
                                    Student ID numbers are never stored in plain text. We utilize a client-side SHA-256 process to ensure that sensitive data remains private while being verifiable on-chain.
                                </p>
                            </div>
                            <div className="bg-[#00113a] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-blue-900/40">
                                <span className="material-symbols-outlined text-blue-400 text-4xl mb-6">lock_reset</span>
                                <h4 className="font-headline font-black text-xl text-white mb-4">Immutable Ledger</h4>
                                <p className="text-sm text-white/60 leading-relaxed font-medium">
                                    Once a credential hash is anchored to the Stellar Testnet, it cannot be modified or deleted without authorization from the verified Master Registrar address.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Tech Stack */}
                    <section className="mb-24" id="tech-stack">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-10 w-1.5 bg-[#4b41e1] rounded-full" />
                            <h2 className="text-4xl font-headline font-black text-[#00113a] dark:text-white tracking-tight">
                                Tech Stack
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-white/5 p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-[#4b41e1] text-4xl mb-6">terminal</span>
                                <h5 className="font-black font-headline text-xl text-[#00113a] dark:text-white mb-4">Rust Core</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Memory-safe systems programming for the on-chain logic and credential anchoring.</p>
                            </div>
                            <div className="bg-white dark:bg-white/5 p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-[#4b41e1] text-4xl mb-6">stars</span>
                                <h5 className="font-black font-headline text-xl text-[#00113a] dark:text-white mb-4">Soroban</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Next-gen smart contracts on Stellar, providing fast finality and low transaction costs.</p>
                            </div>
                            <div className="bg-white dark:bg-white/5 p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-[#4b41e1] text-4xl mb-6">javascript</span>
                                <h5 className="font-black font-headline text-xl text-[#00113a] dark:text-white mb-4">Web SDK</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Integrating Stellar SDK and Soroban-Client for seamless wallet interaction in React.</p>
                            </div>
                        </div>
                    </section>

                    {/* Signature Imagery */}
                    <section className="mb-24">
                        <div className="rounded-[3rem] overflow-hidden h-72 relative border border-slate-200 dark:border-white/5">
                            <img
                                alt="VeracityLink Protocol"
                                className="w-full h-full object-cover grayscale brightness-50 contrast-125 mix-blend-overlay"
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#00113a] via-[#00113a]/40 to-transparent opacity-95" />
                            <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                                <div>
                                    <p className="text-blue-300 text-[10px] uppercase font-black tracking-[0.3em] mb-3">Anchoring Truth Through Hashing</p>
                                    <h4 className="text-white text-3xl font-headline font-black tracking-tight leading-none">VeracityLink Protocol Layer</h4>
                                </div>
                                <div className="flex items-center gap-3 bg-emerald-500 text-[#00113a] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    <span className="material-symbols-outlined text-[18px]">hub</span>
                                    Network Status: Live on Testnet
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="px-16 py-12 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-[#00113a] border-t border-slate-200 dark:border-white/5">
                    <div className="flex flex-col gap-2 mb-6 md:mb-0 text-center md:text-left">
                        <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">
                            © 2026 VeracityLink Decentralized Registry
                        </div>
                        <div className="text-slate-500 dark:text-slate-300 font-headline font-black text-sm uppercase tracking-tighter">
                            Designed & Created by <span className="text-[#4b41e1] dark:text-white">Paul Henry Dacalan</span>
                        </div>
                    </div>
                    <div className="flex space-x-10">
                        <Link className="text-slate-400 hover:text-[#4b41e1] text-[10px] font-black uppercase tracking-widest transition-colors" to="/docs">Privacy Policy</Link>
                        <Link className="text-slate-400 hover:text-[#4b41e1] text-[10px] font-black uppercase tracking-widest transition-colors" to="/docs">Terms of Service</Link>
                        <Link className="text-slate-400 hover:text-[#4b41e1] text-[10px] font-black uppercase tracking-widest transition-colors" to="/docs">Status</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DocumentationPage;
