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
  const { pathname } = request.nextUrl;

  // Verificar se a rota requer autenticação
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Se não for uma rota protegida, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificar se o usuário está autenticado
  const authToken = request.cookies.get('supabase-auth-token')?.value;

  // TEMPORÁRIO: Desabilitar autenticação para demo
  // Se não estiver autenticado, redirecionar para login
  // if (!authToken) {
  //   const url = new URL('/auth/login', request.url);
  //   url.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(url);
  // }

  // Usuário autenticado, permitir acesso
  return NextResponse.next();
}

// Configurar o matcher para aplicar o middleware apenas nas rotas especificadas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/atividades/:path*',
    '/desafios/:path*',
    '/carteira/:path*',
    '/perfil/:path*',
    '/activities/:path*',
    '/profile/:path*',
    '/marketplace/:path*',
  ],
};
