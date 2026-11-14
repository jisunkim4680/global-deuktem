import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  const path = req.nextUrl.pathname

  if (path === '/' || path.startsWith('/api/') || path.startsWith('/_next/') || path === '/favicon.ico') {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads/).*)']
}
