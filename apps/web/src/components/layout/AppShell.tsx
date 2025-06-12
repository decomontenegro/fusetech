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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar desktop - fixed position and better organized */}
      <aside 
        className={`bg-card border-r fixed lg:sticky top-0 z-40 h-screen w-72 
                   transition-transform duration-300 ease-in-out lg:translate-x-0
                   ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
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
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-accent lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-1 flex-1">
            {/* Navigation categories */}
            <div className="mb-6">
              <div className="text-xs uppercase text-muted-foreground font-semibold mb-2 ml-4">Dashboard</div>
              {/* Navigation items */}
              {/* ... */}
            </div>
            
            <div className="mb-6">
              <div className="text-xs uppercase text-muted-foreground font-semibold mb-2 ml-4">Atividades</div>
              {/* Activity navigation items */}
              {/* ... */}
            </div>
            
            <div className="mb-6">
              <div className="text-xs uppercase text-muted-foreground font-semibold mb-2 ml-4">Tokens</div>
              {/* Token navigation items */}
              {/* ... */}
            </div>
          </div>
          
          {/* User profile section */}
          <div className="mt-auto pt-6 border-t">
            <div className="flex items-center mb-4 p-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 mr-3"></div>
              <div>
                <div className="font-medium">Usuário</div>
                <div className="text-xs text-muted-foreground">Minha Conta</div>
              </div>
            </div>
            {/* Logout button */}
          </div>
        </div>
      </aside>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header for desktop */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b bg-card sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Search bar */}
              <div className="relative w-64">
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full h-9 px-3 py-2 bg-background border rounded-md text-sm"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {/* Search icon */}
                </button>
              </div>
              
              {/* Notification center */}
              <NotificationCenter />
              
              {/* User dropdown */}
              {/* ... */}
            </div>
          </div>
        </header>
        
        {/* Mobile header */}
        <header className="lg:hidden bg-card border-b sticky top-0 z-30 flex h-14 items-center px-4">
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

          <NotificationCenter />
        </header>
        
        {/* Main content with better spacing and layout */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
