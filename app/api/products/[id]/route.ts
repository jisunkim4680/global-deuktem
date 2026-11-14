import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { put, del } from '@vercel/blob'
import { getProduct, updateProduct, deleteProduct } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth() } catch {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth('admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }
  const { id } = await params
  const existing = await getProduct(id)
  if (!existing) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 })

  const formData = await req.formData()
  const keepImagesStr = formData.get('keepImages') as string
  let imagesToKeep: string[] = []
  if (keepImagesStr) try { imagesToKeep = JSON.parse(keepImagesStr) } catch {}

  // 삭제할 Blob 이미지 제거
  const imagesToDelete = (existing.images || []).filter(img => !imagesToKeep.includes(img))
  for (const img of imagesToDelete) {
    if (img.includes('vercel-storage.com') || img.includes('blob.vercel-storage')) {
      try { await del(img) } catch {}
    }
  }

  // 새 이미지 업로드
  const newImages: string[] = []
  const files = formData.getAll('images') as File[]
  for (const file of files) {
    if (!file.size || !file.type.startsWith('image/')) continue
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `uploads/${uuidv4()}.${ext}`
    const blob = await put(filename, file, { access: 'public' })
    newImages.push(blob.url)
  }

  const imageUrlsStr = formData.get('imageUrls') as string
  const imageUrls = imageUrlsStr ? imageUrlsStr.split('\n').map(u => u.trim()).filter(u => u.startsWith('http')) : []
  const allImages = [...imagesToKeep, ...imageUrls, ...newImages].slice(0, 10)

  const brand = formData.get('brand') as string
  const name = formData.get('name') as string
  const price = formData.get('price') as string
  const colorsStr = formData.get('colors') as string
  const optionsStr = formData.get('options') as string
  const description = formData.get('description') as string

  const updated = await updateProduct(id, {
    category: (formData.get('category') as string) || existing.category,
    visible: formData.get('visible') !== undefined ? formData.get('visible') !== 'false' : existing.visible,
    status: (formData.get('status') as string) || existing.status,
    brand: brand ? brand.trim() : existing.brand,
    name: name ? name.trim() : existing.name,
    size: ((formData.get('size') as string) || existing.size || '').trim(),
    relatedProducts: formData.get('relatedProducts') ? JSON.parse(formData.get('relatedProducts') as string) : (existing.relatedProducts || []),
    price: price ? parseInt(price, 10) : existing.price,
    discountPrice: (formData.get('discountPrice') as string) ? parseInt(formData.get('discountPrice') as string, 10) : null,
    discountStart: (formData.get('discountStart') as string) ?? existing.discountStart ?? '',
    discountEnd: (formData.get('discountEnd') as string) ?? existing.discountEnd ?? '',
    description: description !== null ? description.slice(0, 3000) : existing.description,
    descriptionAlign: (formData.get('descriptionAlign') as string) || existing.descriptionAlign,
    colors: colorsStr ? colorsStr.split(',').map(c => c.trim()).filter(Boolean) : existing.colors,
    options: optionsStr ? JSON.parse(optionsStr) : existing.options,
    images: allImages
  })

  return NextResponse.json(updated)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth('admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const updates: any = {}
  if (body.visible !== undefined) updates.visible = body.visible
  if (body.status !== undefined) updates.status = body.status

  const updated = await updateProduct(id, updates)
  if (!updated) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth('admin') } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 403 })
  }
  const { id } = await params
  const existing = await getProduct(id)
  if (!existing) return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 })

  // Blob 이미지 삭제
  for (const img of existing.images || []) {
    if (img.includes('vercel-storage.com') || img.includes('blob.vercel-storage')) {
      try { await del(img) } catch {}
    }
  }

  await deleteProduct(id)
  return NextResponse.json({ success: true })
}
