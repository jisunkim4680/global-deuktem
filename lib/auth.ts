import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const tokens = new Map<string, string>()

export function createToken(role: string): string {
  const token = uuidv4()
  tokens.set(token, role)
  return token
}

export function deleteToken(token: string): void {
  tokens.delete(token)
}

export function getRole(token: string): string | undefined {
  return tokens.get(token)
}

export async function getAuthFromCookies(): Promise<{ token: string; role: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  const role = getRole(token)
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
