import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getProducts, saveProducts, Product } from '@/lib/db'
import { COLOR_PRESETS } from '@/lib/colors'
import { requireAuthFromReq } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try { requireAuthFromReq(req, 'admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('csv') as File
  if (!file || !file.size) {
    return NextResponse.json({ error: 'CSV 파일이 필요합니다' }, { status: 400 })
  }

  const text = await file.text()
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV에 헤더와 최소 1개의 데이터가 필요합니다' }, { status: 400 })
  }

  // 헤더 파싱
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
  const requiredFields = ['brand', 'name', 'price']
  for (const field of requiredFields) {
    if (!headers.includes(field)) {
      return NextResponse.json({ error: `CSV에 필수 컬럼이 없습니다: ${field}` }, { status: 400 })
    }
  }

  const now = new Date().toISOString()
  const newProducts: Product[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim() })

    if (!row.brand || !row.name || !row.price) {
      errors.push(`${i + 1}번째 줄: 브랜드, 상품명, 가격은 필수입니다`)
      continue
    }

    const price = parseInt(row.price, 10)
    if (isNaN(price)) {
      errors.push(`${i + 1}번째 줄: 가격이 올바르지 않습니다`)
      continue
    }

    // 이미지 URL은 , 또는 | 구분
    const images = row.images
      ? row.images.split(/[,|]/).map(u => u.trim()).filter(u => u.startsWith('http'))
      : []

    const colors = row.colors
      ? row.colors.split(/[,|]/).map(c => {
          const trimmed = c.trim()
          if (trimmed.startsWith('#')) return trimmed
          const preset = COLOR_PRESETS.find(p => p.name === trimmed)
          return preset ? preset.hex : ''
        }).filter(Boolean)
      : []

    newProducts.push({
      id: uuidv4(),
      category: row.category || '가방',
      brand: row.brand,
      name: row.name,
      size: row.size || '',
      relatedProducts: [],
      price,
      discountPrice: row.discountprice ? parseInt(row.discountprice, 10) : null,
      discountStart: row.discountstart || '',
      discountEnd: row.discountend || '',
      reservationStart: row.reservationstart || '',
      reservationEnd: row.reservationend || '',
      description: row.description || '',
      descriptionAlign: row.descriptionalign || 'center',
      colors,
      options: [],
      images,
      visible: row.visible !== 'false',
      status: row.status || '구매가능',
      createdAt: now,
      updatedAt: now
    })
  }

  if (newProducts.length > 0) {
    const existing = await getProducts()
    await saveProducts([...newProducts, ...existing])
  }

  return NextResponse.json({
    success: true,
    added: newProducts.length,
    errors
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}
