'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  const handleLogout = async () => {
    // Implementar logout depois
    console.log('Logout');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar para desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r p-6 shadow-sm">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              FUSEtech
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
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <button
              className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </aside>

        {/* Layout principal */}
        <main className="flex-1 flex flex-col">
          {/* Header mobile */}
          <header className="md:hidden flex items-center justify-between p-4 border-b bg-white">
            <Link href="/" className="text-xl font-bold text-blue-600">
              FUSEtech
            </Link>

            <button
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => {
                // Implementar toggle mobile menu
              }}
            >
              Menu
            </button>
          </header>

          {/* Conteúdo da página */}
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
  );
}