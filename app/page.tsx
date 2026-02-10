'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { NeuralBackground } from '@/components/features/home/NeuralBackground';
import { AnalyticsDashboard } from '@/components/features/home/AnalyticsDashboard';

export default function LandingPage() {
    const scrollToInsights = () => {
        document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{ scrollBehavior: 'smooth' }}>
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
                    <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                        marginBottom: '24px'
                    }}>
                        Innovation Engine
                    </p>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                        fontWeight: '800',
                        lineHeight: '0.95',
                        letterSpacing: '-0.04em',
                        color: 'var(--foreground)',
                        marginBottom: '24px',
                        maxWidth: '900px'
                    }}>
                        Ideas into
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            impact.
                        </span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
                        color: 'var(--muted)',
                        maxWidth: '440px',
                        marginBottom: '48px',
                        lineHeight: '1.7'
                    }}>
                        Submit process improvements, track AI adoption,
                        and measure operational evolution — all in one place.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link href="/submit" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'var(--foreground)',
                            color: 'var(--background)',
                            padding: '14px 28px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '15px',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}>
                            Submit Idea <ArrowRight size={16} />
                        </Link>

                        <button
                            onClick={scrollToInsights}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'transparent',
                                color: 'var(--foreground)',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '15px',
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            View Insights <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div id="insights" style={{ paddingTop: '80px' }}>
                <AnalyticsDashboard />
            </div>
        </div>
    );
}
