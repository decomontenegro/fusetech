import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Staging-specific middleware configuration
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add staging environment headers
  response.headers.set('X-Environment', 'staging');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  
  // Basic auth for staging (optional - uncomment to enable)
  // const basicAuth = request.headers.get('authorization');
  // const url = request.nextUrl;
  
  // if (!basicAuth) {
  //   url.pathname = '/api/auth/staging';
  //   return NextResponse.rewrite(url);
  // }
  
  // const authValue = basicAuth.split(' ')[1];
  // const [user, pwd] = atob(authValue).split(':');
  
  // if (user !== process.env.STAGING_USER || pwd !== process.env.STAGING_PASSWORD) {
  //   url.pathname = '/api/auth/staging';
  //   return NextResponse.rewrite(url);
  // }
  
  // Add CSP headers for staging
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://staging-api.fusetech.app wss://staging-api.fusetech.app https://www.google-analytics.com https://vitals.vercel-insights.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
  `.replace(/\n/g, '');
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Add performance monitoring headers
  response.headers.set('Server-Timing', `staging;dur=${Date.now()}`);
  
  // Log requests in staging for debugging
  if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true') {
    console.log(`[STAGING] ${request.method} ${request.url}`);
  }
  
  // Rate limiting headers for staging
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  response.headers.set('X-RateLimit-Limit', '1000');
  response.headers.set('X-RateLimit-Remaining', '999');
  response.headers.set('X-Client-IP', ip);
  
  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};