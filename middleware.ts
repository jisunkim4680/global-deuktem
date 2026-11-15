import { NextRequest, NextResponse } from 'next/server'

async function verifyToken(token: string): Promise<string | null> {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null
  const [role, sig] = token.split('.')
  if (!role || !sig) return null

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(role))
  const expected = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')

  if (sig !== expected) return null
  return role
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  const path = req.nextUrl.pathname

  if (path === '/' || path.startsWith('/api/') || path.startsWith('/_next/') || path === '/favicon.ico') {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const role = await verifyToken(token)
  if (!role) {
    const res = NextResponse.redirect(new URL('/', req.url))
    res.cookies.delete('auth-token')
    return res
  }

  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/products', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads/).*)']
}
