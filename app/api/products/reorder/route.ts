import { NextRequest, NextResponse } from 'next/server'
import { getProducts, saveProducts } from '@/lib/db'
import { requireAuthFromReq } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try { requireAuthFromReq(req, 'admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }

  const { ids } = await req.json()
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: 'ids 배열이 필요합니다' }, { status: 400 })
  }

  const products = await getProducts()
  const sorted = ids
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as typeof products

  // ids에 없는 상품은 뒤에 추가
  const remaining = products.filter(p => !ids.includes(p.id))
  await saveProducts([...sorted, ...remaining])

  return NextResponse.json({ success: true })
}
