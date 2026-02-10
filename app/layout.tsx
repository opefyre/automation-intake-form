import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Dock } from '@/components/layout/Dock';
import { RouteGuard } from '@/components/auth/RouteGuard';

export const metadata: Metadata = {
  title: 'Innovation Hub',
  description: 'Internal process improvement engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <RouteGuard>
              <main style={{ paddingBottom: '100px' }}>
                {children}
              </main>
              <Dock />
            </RouteGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
