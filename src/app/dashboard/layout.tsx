'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Activity, Trophy, Gift, Wallet } from 'lucide-react';
import { ProtectedRoute, UserInfo } from '@/components/auth/AuthProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navigationItems = [
  { name: 'Visão Geral', path: '/dashboard', icon: Home },
  { name: 'Atividades', path: '/dashboard/activities', icon: Activity },
  { name: 'Desafios', path: '/dashboard/challenges', icon: Trophy },
  { name: 'Resgates', path: '/dashboard/rewards', icon: Gift },
  { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet, badge: 'BETA' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary flex transition-colors relative">
        {/* Background gradient mesh for depth */}
        <div className="fixed inset-0 mesh-gradient opacity-30 pointer-events-none" />
        
        {/* Sidebar para desktop */}
        <aside className="hidden lg:flex flex-col w-64 glass-strong backdrop-blur-xl border-r border-white/20 p-6 fixed h-full z-30" role="navigation" aria-label="Menu principal">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-gradient">
              FUSEtech
            </Link>
          </div>

          <nav className="space-y-1 flex-1" role="navigation">
            {navigationItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group glass-hover ${
                    isActive
                      ? 'glass bg-primary/10 text-primary border border-primary/20'
                      : 'hover:glass-subtle hover:text-primary'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary' : 'text-tertiary'
                  }`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 space-y-4">
            <ThemeToggle />
            <UserInfo />
          </div>
        </aside>

        {/* Layout principal */}
        <main className="flex-1 flex flex-col lg:ml-64">
          {/* Header mobile */}
          <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b border-white/20 glass-strong backdrop-blur-xl safe-area-inset-top">
            <Link href="/" className="text-xl font-bold text-gradient">
              FUSEtech
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 text-secondary hover:bg-hover rounded-lg transition-colors touch-target"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
              </button>
            </div>
          </header>

          {/* Mobile Navigation Menu - Full Screen Overlay */}
          <div 
            className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
          >
            {/* Backdrop */}
            <div 
              className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div 
              id="mobile-navigation" 
              className={`absolute right-0 top-0 h-full w-full max-w-sm glass-strong backdrop-blur-2xl shadow-2xl transform transition-transform duration-300 border-l border-white/20 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
              role="navigation" 
              aria-label="Menu principal móvel"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-primary/20">
                <h2 className="text-lg font-semibold text-primary">Menu</h2>
                <button
                  className="p-2 text-secondary hover:bg-hover rounded-lg transition-colors touch-target"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Navigation Items */}
              <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                {navigationItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all min-h-touch glass-hover ${
                        isActive
                          ? 'glass bg-primary/10 text-primary border border-primary/20'
                          : 'hover:glass-subtle hover:text-primary active:scale-[0.98]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-primary' : 'text-tertiary'
                      }`} />
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              
              {/* Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary/20 safe-area-inset-bottom bg-primary/5">
                <UserInfo />
              </div>
            </div>
          </div>

          {/* Conteúdo da página - Adjusted for fixed header and bottom nav */}
          <main 
            id="main-content" 
            className="flex-1 px-4 py-6 lg:p-6 overflow-auto bg-primary transition-colors lg:mt-0 mt-16 pb-20 lg:pb-6 safe-area-inset-bottom" 
            role="main"
          >
            <div className="container-mobile">
              {children}
            </div>
          </main>
        </main>
      </div>
    </ProtectedRoute>
  );
}