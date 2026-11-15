import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET 환경변수가 설정되지 않았습니다')
  return secret
}

function sign(role: string): string {
  const sig = crypto.createHmac('sha256', getSecret()).update(role).digest('hex')
  return `${role}.${sig}`
}

export function verify(token: string): string | null {
  const [role, sig] = token.split('.')
  if (!role || !sig) return null
  const expected = crypto.createHmac('sha256', getSecret()).update(role).digest('hex')
  if (sig !== expected) return null
  return role
}

export function createToken(role: string): string {
  return sign(role)
}

export async function getAuthFromCookies(): Promise<{ token: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return null
    const role = verify(token)
    if (!role) return null
    return { token, role }
  } catch {
    return null
  }
}

export function getAuthFromRequest(req: NextRequest): { token: string; role: string } | null {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  const role = verify(token)
  if (!role) return null
  return { token, role }
}

export async function requireAuth(requiredRole?: string): Promise<{ token: string; role: string }> {
  const auth = await getAuthFromCookies()
  if (!auth) throw new Error('로그인이 필요합니다')
  if (requiredRole === 'admin' && auth.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다')
  }
  return auth
}

export function requireAuthFromReq(req: NextRequest, requiredRole?: string): { token: string; role: string } {
  const auth = getAuthFromRequest(req)
  if (!auth) throw new Error('로그인이 필요합니다')
  if (requiredRole === 'admin' && auth.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다')
  }
  return auth
}
