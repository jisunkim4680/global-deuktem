import { NextRequest, NextResponse } from 'next/server'
import { getConfig } from '@/lib/db'
import { createToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password, role } = await req.json()
  const config = await getConfig()

  if (role === 'user' && password === config.userPassword) {
    const token = createToken('user')
    const res = NextResponse.json({ role: 'user' })
    res.cookies.set('auth-token', token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 })
    return res
  }
  if (role === 'admin' && password === config.adminPassword) {
    const token = createToken('admin')
    const res = NextResponse.json({ role: 'admin' })
    res.cookies.set('auth-token', token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 })
    return res
  }

  return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 })
}
