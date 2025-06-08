import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import AuthProvider from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import Script from 'next/script';
import { evaluateFeatureFlags } from '@/lib/feature-flags/server-utils';
import { FeatureFlagDevTools } from '@/components/feature-flags/FeatureFlagDevTools';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: 'FUSEtech App',
  description: 'Tokenize suas atividades físicas e sociais',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Evaluate feature flags on the server
  const serverFlags = await evaluateFeatureFlags();
  
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Essential mobile viewport meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#6366F1" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#818CF8" media="(prefers-color-scheme: dark)" />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            // Prevent flash of incorrect theme
            const savedTheme = localStorage.getItem('theme');
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const theme = savedTheme || 'system';
            const resolvedTheme = theme === 'system' ? systemTheme : theme;
            document.documentElement.setAttribute('data-theme', resolvedTheme);
            document.documentElement.classList.add('no-transition');
            
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                document.documentElement.classList.remove('no-transition');
              }, 100);
            });
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased safe-area-inset`}>
        {/* Skip to main content link for screen readers */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
        >
          Pular para o conteúdo principal
        </a>
        <ThemeProvider>
          <Providers serverFlags={serverFlags}>
            <AuthProvider>
              <div className="min-h-screen bg-primary transition-colors">
                {children}
                <BottomNavigation />
                <Toaster 
                  position="bottom-center" 
                  richColors 
                  theme="system"
                  toastOptions={{
                    className: 'glass safe-area-inset-bottom',
                    style: {
                      bottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
                    },
                  }}
                  expand={false}
                  visibleToasts={3}
                />
              </div>
              <FeatureFlagDevTools />
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}