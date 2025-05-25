import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from './providers';

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
          <div className="min-h-screen">
            {children}
            <Toaster position="top-right" richColors />
          </div>
        </Providers>
      </body>
    </html>
  );
}