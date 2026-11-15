import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getProduct, addProduct } from '@/lib/db'
import { requireAuthFromReq } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { requireAuthFromReq(req, 'admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }

  const { id } = await params
  const existing = await getProduct(id)
  if (!existing) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 })

  const now = new Date().toISOString()
  const copied = {
    ...existing,
    id: uuidv4(),
    name: `${existing.name} (복사본)`,
    relatedProducts: [],
    createdAt: now,
    updatedAt: now
  }

  await addProduct(copied)
  return NextResponse.json(copied, { status: 201 })
}
