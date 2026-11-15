import { NextRequest, NextResponse } from 'next/server'
import { getConfig, saveConfig } from '@/lib/db'
import { requireAuthFromReq } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try { requireAuthFromReq(req, 'admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }
  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: '비밀번호는 4자 이상이어야 합니다' }, { status: 400 })
  }
  const config = await getConfig()
  config.userPassword = newPassword
  await saveConfig(config)
  return NextResponse.json({ success: true })
}
