'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Handle redirect result on mount
    useEffect(() => {
        getRedirectResult(auth)
            .then(async (result) => {
                if (result?.user) {
                    const allowedDomains = ['snoonu.com', 'gmail.com'];
                    const emailDomain = result.user.email?.split('@')[1];

                    if (!emailDomain || !allowedDomains.includes(emailDomain)) {
                        await signOut(auth);
                        setError('Access restricted to company emails only.');
                    }
                }
            })
            .catch((error) => {
                console.error("Redirect sign-in error:", error);
                setError(error.message);
            });
    }, []);

    const signInWithGoogle = async () => {
        setLoading(true);
        setError(null);
        const provider = new GoogleAuthProvider();

        try {
            await signInWithRedirect(auth, provider);
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
