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

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#4f46e5', '#6d28d9', '#5b21b6', '#4338ca', '#3730a3'];
const STATUS_COLORS: Record<string, string> = {
    'Submitted': '#6366f1',
    'In Progress': '#f59e0b',
    'Approved': '#3b82f6',
    'Done': '#10b981',
    'Rejected': '#ef4444',
};

// Shared card style
const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
};

// Shared tooltip style
const tooltipStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: 'var(--foreground)',
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={tooltipStyle}>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
            ))}
        </div>
    );
};

// Render custom pie label
const renderPieLabel = ({ name, percent }: any) => {
    if (percent < 0.05) return null;
    return `${name} ${(percent * 100).toFixed(0)}%`;
};

export const AnalyticsDashboard = () => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdeas = async () => {
            try {
                const snap = await getDocs(collection(db, 'ideas'));
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Idea));
                setIdeas(data);
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
            <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--muted)' }}>
                Loading analytics...
            </div>
        );
    }

    if (ideas.length === 0) {
        return (
            <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--muted)' }}>
                No data yet. Submit your first idea to see analytics.
            </div>
        );
    }

    // --- Compute Metrics ---
    const totalIdeas = ideas.length;
    const completedIdeas = ideas.filter(i => i.status === 'Done' || i.status === 'Approved').length;
    const avgScore = ideas.reduce((sum, i) => sum + (i.score || 0), 0) / totalIdeas;

    // Top category
    const catCounts: Record<string, number> = {};
    ideas.forEach(i => { catCounts[i.categoryId] = (catCounts[i.categoryId] || 0) + 1; });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Status distribution
    const statusData = Object.entries(
        ideas.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    // Category distribution
    const categoryData = Object.entries(catCounts)
        .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 22) + '...' : name, value, fullName: name }))
        .sort((a, b) => b.value - a.value);

    // Submissions over time (by month)
    const monthlyData: Record<string, number> = {};
    ideas.forEach(i => {
        if (i.createdAt?.toDate) {
            const d = i.createdAt.toDate();
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = (monthlyData[key] || 0) + 1;
        }
    });
    const timelineData = Object.entries(monthlyData)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, count }));

    // AI Automation Fit
    const aiData = Object.entries(
        ideas.reduce((acc, i) => { const k = i.aiAutomationFit || 'Unsure'; acc[k] = (acc[k] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    // Impact Type
    const impactData = Object.entries(
        ideas.reduce((acc, i) => { const k = i.impactType || 'Other'; acc[k] = (acc[k] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Department
    const deptData = Object.entries(
        ideas.reduce((acc, i) => { const k = i.department || 'Unknown'; acc[k] = (acc[k] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 17) + '...' : name, value, fullName: name }))
        .sort((a, b) => b.value - a.value);

    // --- KPI Cards ---
    const kpis = [
        { label: 'Total Ideas', value: totalIdeas, icon: Lightbulb, color: '#6366f1' },
        { label: 'Approved / Done', value: completedIdeas, icon: CheckCircle, color: '#10b981' },
        { label: 'Avg Score', value: avgScore.toFixed(1), icon: TrendingUp, color: '#f59e0b' },
        { label: 'Top Category', value: topCategory.length > 20 ? topCategory.slice(0, 17) + '...' : topCategory, icon: Zap, color: '#8b5cf6', small: true },
    ];

    return (
        <div style={{ padding: '0 24px 120px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Section Header */}
            <div style={{ marginBottom: '48px' }}>
                <h2 style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--foreground)',
                    marginBottom: '12px'
                }}>
                    INSIGHTS
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
                    Real-time analytics from submitted ideas
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} style={{
                            ...cardStyle,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: `${kpi.color}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={18} color={kpi.color} />
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                                    {kpi.label}
                                </span>
                            </div>
                            <div style={{
                                fontSize: kpi.small ? '18px' : '32px',
                                fontWeight: 800,
                                color: 'var(--foreground)',
                                letterSpacing: '-0.02em'
                            }}>
                                {kpi.value}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '24px',
            }}>
                {/* Status Distribution */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '20px' }}>
                        Ideas by Status
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                                label={renderPieLabel}
                                labelLine={false}
                            >
                                {statusData.map((entry) => (
                                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', color: 'var(--muted)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '20px' }}>
                        Ideas by Category
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Ideas" radius={[0, 6, 6, 0]}>
                                {categoryData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Submissions Timeline */}
                {timelineData.length > 0 && (
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '20px' }}>
                            Submissions Over Time
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone" dataKey="count" name="Submissions"
                                    stroke="#6366f1" strokeWidth={2}
                                    fill="url(#areaGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* AI Adoption Fit */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '20px' }}>
                        AI & Automation Fit
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={aiData}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                                label={renderPieLabel}
                                labelLine={false}
                            >
                                {aiData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', color: 'var(--muted)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Impact Type */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '20px' }}>
                        Impact Type
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={impactData}>
                            <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Ideas" radius={[6, 6, 0, 0]}>
                                {impactData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Activity */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '20px' }}>
                        Department Activity
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={deptData} layout="vertical" margin={{ left: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Ideas" radius={[0, 6, 6, 0]}>
                                {deptData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
