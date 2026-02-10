'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Idea } from '@/lib/types';
import {
    PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Lightbulb, CheckCircle, Zap } from 'lucide-react';

// Refined, harmonious palette
const CHART_PALETTE = [
    '#818cf8', '#6366f1', '#a78bfa', '#c084fc',
    '#67e8f9', '#34d399', '#fbbf24', '#f472b6',
    '#fb923c', '#38bdf8', '#4ade80',
];

const STATUS_COLORS: Record<string, string> = {
    'Submitted': '#818cf8',
    'In Progress': '#fbbf24',
    'Approved': '#38bdf8',
    'Done': '#34d399',
    'Rejected': '#f87171',
};

const cardStyle: React.CSSProperties = {
    background: 'rgba(10,10,18,0.85)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '20px',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(15,15,20,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '13px',
            color: '#e2e8f0',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
            {label && <p style={{ fontWeight: 600, marginBottom: '4px', color: '#fff' }}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || '#a5b4fc' }}>{p.name}: <strong>{p.value}</strong></p>
            ))}
        </div>
    );
};



export const AnalyticsDashboard = () => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdeas = async () => {
            try {
                const snap = await getDocs(collection(db, 'ideas'));
                setIdeas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Idea)));
            } catch (e) {
                console.error('Failed to load analytics:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchIdeas();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                Loading insights...
            </div>
        );
    }

    if (ideas.length === 0) {
        return (
            <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                No data yet — submit your first idea to unlock insights.
            </div>
        );
    }

    // --- Metrics ---
    const total = ideas.length;
    const completed = ideas.filter(i => i.status === 'Done' || i.status === 'Approved').length;
    const avgScore = (ideas.reduce((s, i) => s + (i.score || 0), 0) / total).toFixed(1);
    const inProgress = ideas.filter(i => i.status === 'In Progress').length;

    // Group helpers
    const groupBy = (key: keyof Idea, fallback = 'Other') =>
        Object.entries(ideas.reduce((a, i) => {
            const k = (i[key] as string) || fallback;
            a[k] = (a[k] || 0) + 1;
            return a;
        }, {} as Record<string, number>))
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

    const statusData = groupBy('status', 'Unknown');
    const categoryData = groupBy('categoryId', 'Uncategorized').map(d => ({
        ...d, shortName: d.name.length > 22 ? d.name.slice(0, 19) + '...' : d.name
    }));
    const aiData = groupBy('aiAutomationFit', 'Unsure');
    const impactData = groupBy('impactType', 'Other');
    const deptData = groupBy('department', 'Unknown').map(d => ({
        ...d, shortName: d.name.length > 18 ? d.name.slice(0, 15) + '...' : d.name
    }));

    // Timeline
    const monthlyBuckets: Record<string, number> = {};
    ideas.forEach(i => {
        if (i.createdAt?.toDate) {
            const d = i.createdAt.toDate();
            const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            monthlyBuckets[key] = (monthlyBuckets[key] || 0) + 1;
        }
    });
    const timelineData = Object.entries(monthlyBuckets)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([month, count]) => ({ month, count }));

    const kpis = [
        { label: 'Total Ideas', value: total, icon: Lightbulb, accent: '#818cf8' },
        { label: 'Approved / Done', value: completed, icon: CheckCircle, accent: '#34d399' },
        { label: 'In Progress', value: inProgress, icon: TrendingUp, accent: '#fbbf24' },
        { label: 'Avg Score', value: avgScore, icon: Zap, accent: '#c084fc' },
    ];

    const chartTitle: React.CSSProperties = {
        fontSize: '13px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '12px',
    };

    const axisTick = { fill: 'rgba(255,255,255,0.35)', fontSize: 11 };

    return (
        <div style={{ padding: '0 24px 140px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Suppress recharts default white hover cursor */}
            <style>{`.recharts-tooltip-cursor { display: none !important; }`}</style>
            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    marginBottom: '12px',
                }}>
                    Platform Analytics
                </p>
                <h2 style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--foreground)',
                    lineHeight: 1.1,
                }}>
                    Real-time insights
                </h2>
            </div>

            {/* KPI Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
            }}>
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} style={{
                            ...cardStyle,
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px',
                                    background: `${kpi.accent}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={16} color={kpi.accent} />
                                </div>
                                <span style={{
                                    fontSize: '12px', fontWeight: 600,
                                    color: 'rgba(255,255,255,0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}>
                                    {kpi.label}
                                </span>
                            </div>
                            <span style={{
                                fontSize: '36px', fontWeight: 800,
                                color: 'var(--foreground)',
                                letterSpacing: '-0.03em',
                                lineHeight: 1,
                            }}>
                                {kpi.value}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '14px',
            }}>
                {/* Status */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>By Status</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={statusData} cx="50%" cy="50%"
                                innerRadius={55} outerRadius={80}
                                paddingAngle={4} dataKey="value"
                                stroke="none"
                            >
                                {statusData.map(e => (
                                    <Cell key={e.name} fill={STATUS_COLORS[e.name] || '#818cf8'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                            <Legend iconType="circle" iconSize={8}
                                wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', paddingTop: '4px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Category */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>By Category</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="shortName" width={140} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                            <Bar dataKey="value" name="Ideas" radius={[0, 8, 8, 0]} barSize={16}>
                                {categoryData.map((_, i) => (
                                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Timeline */}
                {timelineData.length > 0 && (
                    <div style={cardStyle}>
                        <h3 style={chartTitle}>Over Time</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={false} />
                                <Area
                                    type="monotone" dataKey="count" name="Submissions"
                                    stroke="#818cf8" strokeWidth={2}
                                    fill="url(#timeGrad)" dot={{ r: 3, fill: '#818cf8', strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* AI Fit */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>AI & Automation Fit</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={aiData} cx="50%" cy="50%"
                                innerRadius={55} outerRadius={80}
                                paddingAngle={4} dataKey="value"
                                stroke="none"
                            >
                                {aiData.map((_, i) => (
                                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                            <Legend iconType="circle" iconSize={8}
                                wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', paddingTop: '4px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Impact */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>Impact Type</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={impactData}>
                            <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                            <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                            <Bar dataKey="value" name="Ideas" radius={[8, 8, 0, 0]} barSize={32}>
                                {impactData.map((_, i) => (
                                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Department */}
                <div style={cardStyle}>
                    <h3 style={chartTitle}>Department Activity</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={deptData} layout="vertical" margin={{ left: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="shortName" width={110} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                            <Bar dataKey="value" name="Ideas" radius={[0, 8, 8, 0]} barSize={14}>
                                {deptData.map((_, i) => (
                                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
