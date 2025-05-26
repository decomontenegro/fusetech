import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import AuthProvider from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FUSEtech App',
  description: 'Tokenize suas atividades físicas e sociais',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <div className="min-h-screen">
              {children}
              <Toaster position="top-right" richColors />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}