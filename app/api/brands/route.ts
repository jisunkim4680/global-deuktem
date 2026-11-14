import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const products = getProducts()
  const brands = [...new Set(products.map(p => p.brand))].sort()
  return NextResponse.json(brands)
}
