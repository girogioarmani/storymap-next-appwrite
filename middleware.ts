import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('appwrite-session');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no session and trying to access protected route, redirect to sign-in
  if (!session && !isPublicRoute) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If has session and trying to access auth pages, redirect to home
  if (session && isPublicRoute) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
