import { NextRequest, NextResponse } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/atividades',
  '/desafios',
  '/carteira',
  '/perfil',
  '/activities',
  '/profile',
  '/marketplace',
];

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/terms',
  '/privacy',
];

export function middleware(request: NextRequest) {
  // Para demo, permitir acesso a todas as rotas
  return NextResponse.next();
}

// Configurar o matcher - simplificado para demo
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
