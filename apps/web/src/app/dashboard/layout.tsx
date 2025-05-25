'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const navigationItems = [
  { name: 'Visão Geral', path: '/dashboard' },
  { name: 'Atividades', path: '/dashboard/activities' },
  { name: 'Desafios', path: '/dashboard/challenges' },
  { name: 'Resgates', path: '/dashboard/rewards' },
  { name: 'Wallet', path: '/dashboard/wallet' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar para desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-card border-r p-6">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              FuseLabs
            </Link>
          </div>

          <nav className="space-y-1 flex-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </aside>

        {/* Layout principal */}
        <main className="flex-1 flex flex-col">
          {/* Header mobile */}
          <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <Link href="/" className="text-xl font-bold text-primary">
              FuseLabs
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Implementar toggle mobile menu
              }}
            >
              Menu
            </Button>
          </header>

          {/* Conteúdo da página */}
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}