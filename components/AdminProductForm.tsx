'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { COLOR_PRESETS } from '@/lib/colors'

interface ProductData {
  id?: string; brand?: string; name?: string; size?: string
  relatedProducts?: string[]
  price?: number; discountPrice?: number | null; discountStart?: string; discountEnd?: string
  category?: string
  description?: string; descriptionAlign?: string; colors?: string[]
  options?: any[]; images?: string[]; visible?: boolean; status?: string
}

interface SimpleProduct {
  id: string; brand: string; name: string; size: string; images: string[]
}

interface Props {
  initialData?: ProductData
}

export default function AdminProductForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [brand, setBrand] = useState(initialData?.brand || '')
  const [name, setName] = useState(initialData?.name || '')
  const [size, setSize] = useState(initialData?.size || '')
  const [relatedIds, setRelatedIds] = useState<string[]>(initialData?.relatedProducts || [])
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [discountPrice, setDiscountPrice] = useState(initialData?.discountPrice?.toString() || '')
  const [discountStart, setDiscountStart] = useState(initialData?.discountStart || '')
  const [discountEnd, setDiscountEnd] = useState(initialData?.discountEnd || '')
  const [category, setCategory] = useState(initialData?.category || '가방')
  const [description, setDescription] = useState(initialData?.description || '')
  const [descriptionAlign, setDescriptionAlign] = useState(initialData?.descriptionAlign || 'center')
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.colors || [])
  const [visible, setVisible] = useState(initialData?.visible ?? true)
  const [status, setStatus] = useState(initialData?.status || '구매가능')
  const [keepImages, setKeepImages] = useState<string[]>(initialData?.images || [])
  const [newFiles, setNewFiles] = useState<FileList | null>(null)
  const [imageUrls, setImageUrls] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 상품 목록 (다른 사이즈 선택용)
  const [allProducts, setAllProducts] = useState<SimpleProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then((products: SimpleProduct[]) => {
      setAllProducts(products.filter(p => p.id !== initialData?.id))
    })
  }, [initialData?.id])

  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(p =>
        !relatedIds.includes(p.id) &&
        (p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : []

  const selectedRelated = allProducts.filter(p => relatedIds.includes(p.id))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const fd = new FormData()
    fd.append('brand', brand)
    fd.append('name', name)
    fd.append('size', size)
    fd.append('relatedProducts', JSON.stringify(relatedIds))
    fd.append('price', price)
    fd.append('discountPrice', discountPrice)
    fd.append('discountStart', discountStart)
    fd.append('discountEnd', discountEnd)
    fd.append('category', category)
    fd.append('description', description)
    fd.append('descriptionAlign', descriptionAlign)
    fd.append('colors', selectedColors.join(','))
    fd.append('visible', String(visible))
    fd.append('status', status)
    fd.append('options', JSON.stringify([]))

    if (isEdit) fd.append('keepImages', JSON.stringify(keepImages))
    if (imageUrls.trim()) fd.append('imageUrls', imageUrls.trim())
    if (newFiles) {
      for (let i = 0; i < newFiles.length; i++) fd.append('images', newFiles[i])
    }

    const url = isEdit ? `/api/products/${initialData!.id}` : '/api/products'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, { method, body: fd })
    if (res.ok) {
      window.location.href = '/admin'
    } else {
      const data = await res.json()
      setError(data.error || '저장에 실패했습니다')
    }
    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', fontSize: 14, border: '1px solid #ecebe8', outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#3d3c39', marginBottom: 6, display: 'block' }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 40, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32 }}>
        {isEdit ? '상품 수정' : '상품 등록'}
      </h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div><label style={labelStyle}>브랜드 *</label><input style={inputStyle} value={brand} onChange={e => setBrand(e.target.value)} required /></div>
        <div><label style={labelStyle}>상품명 *</label><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required /></div>
        <div><label style={labelStyle}>사이즈</label><input style={inputStyle} value={size} onChange={e => setSize(e.target.value)} placeholder="예: 스몰, 미니, 미디엄" /></div>
        <div><label style={labelStyle}>가격 *</label><input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))} required /></div>
        <div style={{ border: '1px solid #ecebe8', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>할인 설정 (선택)</label>
          <div><label style={{ fontSize: 12, color: '#6b6a66', marginBottom: 4, display: 'block' }}>할인가</label><input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={discountPrice} onChange={e => setDiscountPrice(e.target.value.replace(/[^0-9]/g, ''))} placeholder="할인가 입력 (비워두면 할인 없음)" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 12, color: '#6b6a66', marginBottom: 4, display: 'block' }}>할인 시작일</label><input style={inputStyle} type="date" value={discountStart} onChange={e => setDiscountStart(e.target.value)} /></div>
            <div><label style={{ fontSize: 12, color: '#6b6a66', marginBottom: 4, display: 'block' }}>할인 종료일</label><input style={inputStyle} type="date" value={discountEnd} onChange={e => setDiscountEnd(e.target.value)} /></div>
          </div>
        </div>
        <div>
          <label style={labelStyle}>카테고리</label>
          <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
            <option>가방</option><option>옷</option><option>신발</option><option>지갑</option><option>액세서리</option><option>키링</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>상태</label>
          <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value)}>
            <option>구매가능</option><option>품절</option><option>예약중</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>전시 여부</label>
          <label style={{ fontSize: 14 }}>
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> 전시
          </label>
        </div>
        <div>
          <label style={labelStyle}>색상 선택</label>
          {selectedColors.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {selectedColors.map((hex, i) => {
                const preset = COLOR_PRESETS.find(c => c.hex === hex)
                return (
                  <button key={i} type="button" onClick={() => setSelectedColors(prev => prev.filter((_, j) => j !== i))}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: '1px solid #ecebe8', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: hex, border: '1px solid #d6d5d1', flexShrink: 0 }} />
                    {preset?.name || hex}
                    <span style={{ color: '#b3261e', marginLeft: 4 }}>×</span>
                  </button>
                )
              })}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {COLOR_PRESETS.filter(c => !selectedColors.includes(c.hex)).map(c => (
              <button key={c.hex} type="button" onClick={() => setSelectedColors(prev => [...prev, c.hex])}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1px solid #ecebe8', background: '#fbfbfa', cursor: 'pointer', fontSize: 12 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, border: '1px solid #d6d5d1', flexShrink: 0 }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>설명</label>
          <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>설명 정렬</label>
          <select style={inputStyle} value={descriptionAlign} onChange={e => setDescriptionAlign(e.target.value)}>
            <option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option>
          </select>
        </div>

        {/* 연관 상품 */}
        <div>
          <label style={labelStyle}>연관 상품</label>
          {selectedRelated.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              {relatedIds.map((rid, i) => {
                const p = selectedRelated.find(sp => sp.id === rid)
                if (!p) return null
                return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #ecebe8', background: '#fff' }}>
                  {i > 0 && (
                    <button type="button" onClick={() => setRelatedIds(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a })}
                      style={{ background: '#f1f0ed', border: '1px solid #ecebe8', cursor: 'pointer', fontSize: 11, width: 22, height: 22 }}>←</button>
                  )}
                  {p.images[0] && (
                    <div style={{ width: 36, height: 45, background: `url(${p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`}) center/cover`, flexShrink: 0 }} />
                  )}
                  <div style={{ fontSize: 13 }}>
                    <div style={{ color: '#6b6a66' }}>{p.brand}</div>
                    <div>{p.name}{p.size ? ` (${p.size})` : ''}</div>
                  </div>
                  {i < relatedIds.length - 1 && (
                    <button type="button" onClick={() => setRelatedIds(prev => { const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a })}
                      style={{ background: '#f1f0ed', border: '1px solid #ecebe8', cursor: 'pointer', fontSize: 11, width: 22, height: 22 }}>→</button>
                  )}
                  <button type="button" onClick={() => setRelatedIds(prev => prev.filter(id => id !== p.id))}
                    style={{ background: 'none', border: 0, color: '#b3261e', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
                </div>
                )
              })}
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <input
              style={inputStyle}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="상품명 또는 브랜드로 검색..."
            />
            {filteredProducts.length > 0 && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 10,
                border: '1px solid #ecebe8', background: '#fff', maxHeight: 260, overflowY: 'auto'
              }}>
                {filteredProducts.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => { setRelatedIds(prev => [...prev, p.id]); setSearchQuery('') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
                      border: 'none', borderBottom: '1px solid #ecebe8', background: '#fff', cursor: 'pointer', textAlign: 'left'
                    }}>
                    {p.images[0] && (
                      <div style={{ width: 32, height: 40, background: `url(${p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`}) center/cover`, flexShrink: 0 }} />
                    )}
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: '#6b6a66' }}>{p.brand}</span> {p.name}{p.size ? ` (${p.size})` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isEdit && keepImages.length > 0 && (
          <div>
            <label style={labelStyle}>기존 이미지 (드래그 또는 화살표로 순서 변경)</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {keepImages.map((img, i) => (
                <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 80, height: 100, background: `url(${img.startsWith('http') ? img : `/uploads/${img}`}) center/cover`, border: i === 0 ? '2px solid #141413' : '1px solid #ecebe8' }} />
                  <div style={{ display: 'flex', gap: 2 }}>
                    {i > 0 && (
                      <button type="button" onClick={() => setKeepImages(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a })}
                        style={{ width: 24, height: 20, background: '#f1f0ed', border: '1px solid #ecebe8', cursor: 'pointer', fontSize: 11 }}>←</button>
                    )}
                    {i < keepImages.length - 1 && (
                      <button type="button" onClick={() => setKeepImages(prev => { const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a })}
                        style={{ width: 24, height: 20, background: '#f1f0ed', border: '1px solid #ecebe8', cursor: 'pointer', fontSize: 11 }}>→</button>
                    )}
                  </div>
                  <button type="button" onClick={() => setKeepImages(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#b3261e', color: '#fff', border: 0, fontSize: 12, cursor: 'pointer' }}>
                    ×
                  </button>
                  {i === 0 && <span style={{ fontSize: 10, color: '#6b6a66' }}>대표</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <label style={labelStyle}>이미지 URL (한 줄에 하나씩)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={imageUrls}
            onChange={e => setImageUrls(e.target.value)}
            placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
          />
        </div>
        <div>
          <label style={labelStyle}>또는 이미지 파일 업로드 (최대 10장)</label>
          <input type="file" accept="image/*,.avif" multiple onChange={e => setNewFiles(e.target.files)} />
        </div>
        {error && <p style={{ color: '#b3261e', fontSize: 13 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => router.back()} style={{
            flex: 1, padding: '16px', fontSize: 15, fontWeight: 600, background: '#fff',
            color: '#141413', border: '1px solid #ecebe8', cursor: 'pointer'
          }}>
            취소하기
          </button>
          <button type="submit" disabled={submitting} style={{
            flex: 1, padding: '16px', fontSize: 15, fontWeight: 600, background: '#141413',
            color: '#fbfbfa', border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1
          }}>
            {submitting ? '저장 중...' : (isEdit ? '수정하기' : '등록하기')}
          </button>
        </div>
      </form>
    </div>
  )
}
