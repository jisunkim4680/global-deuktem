import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/db'
import { requireAuthFromReq } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuthFromReq(req)
  } catch {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const products = await getProducts()
  const brands = [...new Set(products.map(p => p.brand))].sort()
  return NextResponse.json(brands)
}
