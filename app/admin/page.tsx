'use client';

import { AdminKanban } from '@/components/features/admin/AdminKanban';

export default function AdminPage() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--background)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 50 // Below Dock (100) but above main content
        }}>
            <div style={{
                padding: '24px 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0
            }}>
                <h1 style={{ color: 'var(--foreground)', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    MISSION CONTROL
                </h1>
                <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
            </div>

            <div style={{
                flex: 1,
                minHeight: 0,
                width: '100%',
                paddingTop: '24px'
            }}>
                <AdminKanban />
            </div>
        </div>
    );
}
