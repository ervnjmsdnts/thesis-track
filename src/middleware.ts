import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const { isAuthenticated } = getKindeServerSession();

  const authenticated = isAuthenticated();

  const pathname = req.nextUrl.pathname;

  if (pathname.includes('dashboard') && !authenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (authenticated && pathname === '/')
    return NextResponse.redirect(new URL('/dashboard', req.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
};
