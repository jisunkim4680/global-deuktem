import { NextRequest, NextResponse } from 'next/server'
import { getConfig, saveConfig } from '@/lib/db'
import { requireAuthFromReq } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try { requireAuthFromReq(req, 'admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }
  const { currentPassword, newPassword } = await req.json()
  const config = await getConfig()

  if (currentPassword !== config.adminPassword) {
    return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다' }, { status: 400 })
  }
  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: '새 비밀번호는 4자 이상이어야 합니다' }, { status: 400 })
  }
  config.adminPassword = newPassword
  await saveConfig(config)
  return NextResponse.json({ success: true })
}
