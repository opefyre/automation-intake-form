'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { NeuralBackground } from '@/components/features/home/NeuralBackground';
import { Shield, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, error } = useAuth();

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--background)'
        }}>
            <NeuralBackground />

            <div style={{
                zIndex: 10,
                background: 'rgba(var(--card), 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 0 30px var(--accent-glow)'
                }}>
                    <Shield size={32} />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                        Innovation Hub
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                        Sign in with your company account.
                    </p>
                </div>

                <button
                    onClick={() => signInWithGoogle()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: 'var(--card-hover)',
                        color: 'var(--foreground)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '16px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.background = 'var(--border)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'var(--card-hover)';
                    }}
                >
                    <LogIn size={20} />
                    Sign in with SSO
                </button>

                {error && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        fontSize: '12px',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
