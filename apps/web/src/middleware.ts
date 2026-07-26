import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/barbeiro': ['BARBER', 'ADMIN'],
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const session = req.auth

  for (const [prefix, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      if (!session) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.redirect(new URL('/acesso-negado', req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/barbeiro/:path*'],
}
