import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

/**
 * Navigation guard that ensures connected users have an on-chain identity.
 * - If connected but unregistered: redirect to /register
 * - If registered but on /register: redirect to /profile
 */
const RegistrationGate = ({ children }) => {
    const { walletAddress, getStudentProfile, getAdmin } = useWallet();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRegistered, setIsRegistered] = React.useState(null); // null = checking, true/false = result
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (!walletAddress) {
                setIsRegistered(false);
                setIsAdmin(false);
                return;
            }
            setIsLoading(true);
            try {
                // 1. Check if Admin (Always force a fresh check for security)
                const adminAddr = await getAdmin();
                if (adminAddr === walletAddress) {
                    setIsAdmin(true);
                    setIsRegistered(true);
                    return;
                }

                // 2. Check if Registered Student (Bypass cache to see fresh registration)
                const profile = await getStudentProfile(walletAddress, true); // force=true
                setIsRegistered(!!profile);
                setIsAdmin(false);
            } catch (err) {
                console.error("Gatekeeper error:", err);
                setIsRegistered(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkStatus();
    }, [walletAddress, getStudentProfile, getAdmin, location.pathname]);

    useEffect(() => {
        if (isLoading) return;

        const isRegisterPage = location.pathname === '/register';
        const isLandingPage = location.pathname === '/';
        const isLoginPage = location.pathname === '/login';
        const isVerifyPage = location.pathname === '/verify';
        const isAdminPage = location.pathname === '/admin';

        // Public pages that don't need a gate
        // Bypass landing page only if NOT connected OR registered/admin
        const isBypassPage = isLoginPage || isVerifyPage || isAdminPage;
        const landingBypass = isLandingPage && (!walletAddress || isRegistered === true || isAdmin);

        if (isBypassPage || landingBypass) return;

        // 1. Admin Logic: Admins don't register as students
        if (isAdmin) {
            if (isRegisterPage) navigate('/admin');
            return;
        }

        // 2. Student Logic
        if (walletAddress && isRegistered === false && !isRegisterPage) {
            console.log("Unregistered student: Redirecting to register...");
            navigate('/register');
        } else if (walletAddress && isRegistered === true && isRegisterPage) {
            console.log("Already registered: Moving to profile...");
            navigate('/profile');
        }
    }, [walletAddress, isRegistered, isLoading, location.pathname, navigate]);

    return children;
};

export default RegistrationGate;
