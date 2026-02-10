'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // If not logged in and not on login page, redirect to login
        if (!user && pathname !== '/login') {
            router.replace('/login');
        }

        // If logged in and on login page, redirect to home
        if (user && pathname === '/login') {
            router.replace('/');
        }

        // Admin Route Protection
        if (user && pathname.startsWith('/admin') && user.email !== 'opefyre@gmail.com') {
            router.replace('/feed');
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)'
            }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    // Always render children — redirects are handled by useEffect above
    return <>{children}</>;
};
