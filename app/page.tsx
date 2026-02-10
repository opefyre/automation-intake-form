'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { NeuralBackground } from '@/components/features/home/NeuralBackground';
import { AnalyticsDashboard } from '@/components/features/home/AnalyticsDashboard';

export default function LandingPage() {
    return (
        <div>
            {/* Hero Section */}
            <div style={{ position: 'relative', minHeight: '100vh' }}>
                <NeuralBackground />
                <div style={{
                    position: 'relative',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '24px',
                    textAlign: 'center',
                    zIndex: 10
                }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        fontWeight: '900',
                        lineHeight: '0.9',
                        letterSpacing: '-0.04em',
                        color: 'var(--foreground)',
                        marginBottom: '32px',
                        maxWidth: '1200px'
                    }}>
                        PROCESS<br />
                        INNOVATION.
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                        color: 'var(--muted)',
                        maxWidth: '600px',
                        marginBottom: '64px',
                        lineHeight: '1.6'
                    }}>
                        Submit ideas. Track optimization. Leverage AI.<br />
                        The central hub for operational evolution.
                    </p>

                    <Link href="/submit" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'var(--foreground)',
                        color: 'var(--background)',
                        padding: '16px 32px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        fontSize: '16px',
                        textDecoration: 'none',
                        transition: 'transform 0.2s'
                    }}>
                        Submit Idea <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div style={{ paddingTop: '80px' }}>
                <AnalyticsDashboard />
            </div>
        </div>
    );
}
