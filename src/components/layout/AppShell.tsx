'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import {
  Home,
  Activity,
  Award,
  Wallet,
  User,
  Menu,
  X,
  LogOut,
  Shield,
  Settings,
  Bell,
  Lightbulb,
  BarChart,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Users,
  Link as LinkIcon
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    {
      label: 'Início',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      isActive: pathname === '/dashboard'
    },
    {
      label: 'Atividades',
      href: '/atividades',
      icon: <Activity className="h-5 w-5" />,
      isActive: pathname?.startsWith('/atividades')
    },
    {
      label: 'Desafios',
      href: '/desafios',
      icon: <Award className="h-5 w-5" />,
      isActive: pathname?.startsWith('/desafios')
    },
    {
      label: 'Planos',
      href: '/planos',
      icon: <Calendar className="h-5 w-5" />,
      isActive: pathname?.startsWith('/planos')
    },
    {
      label: 'Missões',
      href: '/missoes',
      icon: <Target className="h-5 w-5" />,
      isActive: pathname?.startsWith('/missoes')
    },
    {
      label: 'Análises',
      href: '/analytics',
      icon: <BarChart className="h-5 w-5" />,
      isActive: pathname?.startsWith('/analytics')
    },
    {
      label: 'Previsões',
      href: '/previsoes',
      icon: <TrendingUp className="h-5 w-5" />,
      isActive: pathname?.startsWith('/previsoes')
    },
    {
      label: 'Conquistas',
      href: '/conquistas',
      icon: <Trophy className="h-5 w-5" />,
      isActive: pathname?.startsWith('/conquistas')
    },
    {
      label: 'Comunidade',
      href: '/comunidade',
      icon: <Users className="h-5 w-5" />,
      isActive: pathname?.startsWith('/comunidade')
    },
    {
      label: 'Integrações',
      href: '/integracao',
      icon: <LinkIcon className="h-5 w-5" />,
      isActive: pathname?.startsWith('/integracao')
    },
    {
      label: 'Carteira',
      href: '/carteira',
      icon: <Wallet className="h-5 w-5" />,
      isActive: pathname?.startsWith('/carteira')
    },
    {
      label: 'Perfil',
      href: '/perfil',
      icon: <User className="h-5 w-5" />,
      isActive: pathname?.startsWith('/perfil')
    },
  ];

  // Itens de administração
  const adminItems = user?.role === 'admin' ? [
    {
      label: 'Admin: Atividades',
      href: '/admin/atividades',
      icon: <Shield className="h-5 w-5" />,
      isActive: pathname?.startsWith('/admin/atividades')
    },
    {
      label: 'Admin: Config',
      href: '/admin/configuracoes',
      icon: <Settings className="h-5 w-5" />,
      isActive: pathname?.startsWith('/admin/configuracoes')
    },
  ] : [];

  // Combinar itens de navegação
  const allNavItems = [...navItems, ...adminItems];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header mobile */}
      <header className="bg-card border-b sticky top-0 z-30 flex md:hidden h-14 items-center px-4">
        <button
          onClick={toggleSidebar}
          className="mr-2 p-2 rounded-md hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 flex justify-center">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="FuseLabs"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="font-bold text-xl">FuseLabs</span>
          </Link>
        </div>

        <div className="flex items-center">
          <NotificationCenter />
        </div>
      </header>

      {/* Overlay para o sidebar mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 z-50 w-72 border-r bg-card pt-4 transition-transform duration-300 md:translate-x-0 md:z-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-4 mb-6">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="FuseLabs"
              width={40}
              height={40}
              className="mr-2"
            />
            <span className="font-bold text-2xl">FuseLabs</span>
          </Link>

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-2">
          {/* Itens de navegação principais */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center px-3 py-2.5 rounded-md group transition-colors
                ${item.isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'}
              `}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}

          {/* Itens de administração */}
          {adminItems.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase">
                Administração
              </p>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2.5 rounded-md group transition-colors
                    ${item.isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'}
                  `}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="bg-card border rounded-lg p-3 mb-2">
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.email || 'Usuário'}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 rounded-md border hover:bg-accent transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 md:ml-72 pt-0 md:pt-4 pb-16`}>
        <div className="container px-4 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t flex items-center justify-around py-2">
        {/* Mostrar apenas os 5 itens principais no mobile */}
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center justify-center px-3 py-2 rounded-md transition-colors
              ${item.isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}