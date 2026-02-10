'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, LayoutDashboard, Zap, User, Sun, Moon, Shield } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
            }}
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};

export const Dock = () => {
    const { user, signInWithGoogle, logout } = useAuth();
    const pathname = usePathname();
    const [hovered, setHovered] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Hide dock when not logged in or not yet mounted (SSR/hydration safe)
    if (!mounted || !user) return null;

    const items = [
        { id: 'home', label: 'Home', icon: Home, href: '/' },
        // { id: 'feed', label: 'Feed', icon: Grid, href: '/feed' }, // Removed as per request (or merged into Home?) - Keeping Home as the main entry
        // Wait, the user didn't ask to remove Feed, but the Feed is now part of the flow? 
        // Let's keep specific links: Home, Feed (maybe?), Submit, Admin.
        // Actually, the previous Dock had Home, Feed, Submit, Admin. The user asked to remove "Internal Engine" text but didn't say remove Feed link.
        // However, I see I removed "Grid" import in previous bad edit. Let's restore "Feed" link if it was there, or stick to Home/Submit/Admin if that's the new flow.
        // The previous file content usually had Home, Feed, Submit, Admin.
        // I'll re-add Feed to be safe, using LayoutDashboard or similar if Grid is missing? Or re-import Grid.
        // Re-reading previous file content... it had Grid.
        // I'll add Feed back.
        { id: 'feed', label: 'Feed', icon: LayoutDashboard, href: '/feed' },
        { id: 'submit', label: 'Submit', icon: PlusCircle, href: '/submit' },
        // Only show Admin for specific email
        ...(user.email === 'opefyre@gmail.com' ? [{ id: 'admin', label: 'Admin', icon: Shield, href: '/admin' }] : []),
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            padding: '12px 24px',
            backgroundColor: 'rgba(10, 10, 10, 0.8)', // #0A0A0A transparent -> Needs var for light mode?
            // For now, let's keep Dock dark even in light mode? Or variable?
            // Plan said: "Dock ... Add ThemeToggle".
            // Let's use hardcoded dark for now to maintain "OS" feel or use variables.
            // Using variables is better:
            background: 'var(--card)', // This will switch to white in light mode
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: '9999px',
            zIndex: 100,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
            {items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        onMouseEnter={() => setHovered(item.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? 'var(--card-hover)' : 'transparent',
                            color: isActive ? 'var(--foreground)' : 'var(--muted)',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            transform: hovered === item.id ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                            position: 'relative'
                        }}
                    >
                        <Icon size={20} />
                        {isActive && <div style={{
                            position: 'absolute',
                            bottom: '-6px',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent)'
                        }} />}
                    </Link>
                );
            })}

            {/* Divider */}
            <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

            {/* User / Auth */}
            {user ? (
                <>
                    <button
                        onClick={() => logout()}
                        title="Sign Out"
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            background: 'transparent',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{
                                width: '100%', height: '100%',
                                background: 'var(--card-hover)', color: 'var(--foreground)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <User size={20} />
                            </div>
                        )}
                    </button>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px', alignSelf: 'center' }} />

                    <div style={{ alignSelf: 'center' }}>
                        <ThemeToggle />
                    </div>
                </>
            ) : (
                <button
                    onClick={() => signInWithGoogle()}
                    title="Sign In"
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 12px var(--accent-glow)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <User size={20} />
                </button>
            )}
        </div>
    );
};
