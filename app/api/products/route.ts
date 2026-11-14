import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { put } from '@vercel/blob'
import { getProducts, addProduct } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  let auth
  try { auth = await requireAuth() } catch {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const brand = searchParams.get('brand')
  const category = searchParams.get('category')

  let products = await getProducts()

  if (auth.role !== 'admin') {
    products = products.filter(p => p.visible)
  }
  if (brand) products = products.filter(p => p.brand === brand)
  if (category) products = products.filter(p => p.category === category)
  if (search) {
    const kw = search.toLowerCase()
    products = products.filter(p =>
      p.brand.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw)
    )
  }

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try { await requireAuth('admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }

  const formData = await req.formData()
  const brand = formData.get('brand') as string
  const name = formData.get('name') as string
  const price = formData.get('price') as string

  if (!brand || !name || !price) {
    return NextResponse.json({ error: '브랜드, 상품명, 가격은 필수입니다' }, { status: 400 })
  }

  // 파일 업로드 → Vercel Blob에 저장
  const imageFilenames: string[] = []
  const files = formData.getAll('images') as File[]
  for (const file of files) {
    if (!file.size || !file.type.startsWith('image/')) continue
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `uploads/${uuidv4()}.${ext}`
    const blob = await put(filename, file, { access: 'public' })
    imageFilenames.push(blob.url)
  }

  const colorsStr = formData.get('colors') as string
  const optionsStr = formData.get('options') as string
  const imageUrlsStr = formData.get('imageUrls') as string
  const imageUrls = imageUrlsStr ? imageUrlsStr.split('\n').map(u => u.trim()).filter(u => u.startsWith('http')) : []
  const now = new Date().toISOString()

  const product = {
    id: uuidv4(),
    category: (formData.get('category') as string) || '가방',
    visible: formData.get('visible') !== 'false',
    status: (formData.get('status') as string) || '구매가능',
    brand: brand.trim(),
    name: name.trim(),
    size: ((formData.get('size') as string) || '').trim(),
    relatedProducts: formData.get('relatedProducts') ? JSON.parse(formData.get('relatedProducts') as string) : [],
    price: parseInt(price, 10),
    discountPrice: (formData.get('discountPrice') as string) ? parseInt(formData.get('discountPrice') as string, 10) : null,
    discountStart: (formData.get('discountStart') as string) || '',
    discountEnd: (formData.get('discountEnd') as string) || '',
    description: ((formData.get('description') as string) || '').slice(0, 3000),
    descriptionAlign: (formData.get('descriptionAlign') as string) || 'center',
    colors: colorsStr ? colorsStr.split(',').map(c => c.trim()).filter(Boolean) : [],
    options: optionsStr ? JSON.parse(optionsStr) : [],
    images: [...imageUrls, ...imageFilenames],
    createdAt: now,
    updatedAt: now
  }

  await addProduct(product)
  return NextResponse.json(product, { status: 201 })
}
