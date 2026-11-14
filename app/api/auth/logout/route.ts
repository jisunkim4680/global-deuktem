import { NextRequest, NextResponse } from 'next/server'
import { deleteToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  if (token) deleteToken(token)
  const res = NextResponse.json({ success: true })
  res.cookies.delete('auth-token')
  return res
}
