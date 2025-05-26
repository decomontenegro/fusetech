import { NextRequest, NextResponse } from 'next/server';

// Rotas que NÃO precisam de autenticação (públicas)
const publicRoutes = [
  '/',
  '/login',
  '/terms',
  '/privacy',
  '/support',
  '/api/auth/strava',
  '/api/auth/google',
  '/api/auth/apple'
];

// Rotas que SEMPRE precisam de autenticação
const protectedRoutes = [
  '/dashboard',
  '/activities',
  '/profile',
  '/marketplace'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  );

  // Se for rota protegida, verificar autenticação via localStorage
  if (isProtectedRoute) {
    // Como middleware não tem acesso ao localStorage, vamos usar uma abordagem diferente
    // Vamos permitir que o ProtectedRoute component faça a verificação
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configurar o matcher - simplificado para demo
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
