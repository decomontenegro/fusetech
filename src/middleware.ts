import { NextRequest, NextResponse } from 'next/server';
import { featureFlagMiddleware } from '@/lib/feature-flags/middleware';

// Rotas que NÃO precisam de autenticação (públicas)
const publicRoutes = [
  '/',
  '/login',
  '/terms',
  '/privacy',
  '/support',
  '/api/auth/strava',
  '/api/auth/google',
  '/api/auth/apple',
  '/feature-unavailable'
];

// Rotas que SEMPRE precisam de autenticação
const protectedRoutes = [
  '/dashboard',
  '/activities',
  '/profile',
  '/marketplace'
];

export async function middleware(request: NextRequest) {
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
    // Mas primeiro, vamos verificar feature flags
    const featureFlagResponse = await featureFlagMiddleware(request);
    if (featureFlagResponse.status === 307) {
      // Feature flag redirect
      return featureFlagResponse;
    }
    
    return NextResponse.next();
  }

  // Check feature flags for all routes
  const featureFlagResponse = await featureFlagMiddleware(request);
  if (featureFlagResponse.status === 307) {
    // Feature flag redirect
    return featureFlagResponse;
  }

  return NextResponse.next();
}

// Configurar o matcher - simplificado para demo
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
