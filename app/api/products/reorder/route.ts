import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { requireAuthFromReq } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try { requireAuthFromReq(req, 'admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }

  const { ids } = await req.json()
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: 'ids 배열이 필요합니다' }, { status: 400 })
  }

  const sql = neon(process.env.DATABASE_URL!)
  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE products SET sort_order = ${i} WHERE id = ${ids[i]}`
  }

  return NextResponse.json({ success: true })
}
