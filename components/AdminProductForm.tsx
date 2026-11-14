'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { COLOR_PRESETS } from '@/lib/colors'

interface ProductData {
  id?: string; brand?: string; name?: string; price?: number; category?: string
  description?: string; descriptionAlign?: string; colors?: string[]
  options?: any[]; images?: string[]; visible?: boolean; status?: string
}

interface Props {
  initialData?: ProductData
}

export default function AdminProductForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [brand, setBrand] = useState(initialData?.brand || '')
  const [name, setName] = useState(initialData?.name || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const fd = new FormData()
    fd.append('brand', brand)
    fd.append('name', name)
    fd.append('price', price)
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
      router.push('/admin')
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
        <div><label style={labelStyle}>가격 *</label><input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} required /></div>
        <div>
          <label style={labelStyle}>카테고리</label>
          <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
            <option>가방</option><option>옷</option><option>신발</option><option>악세서리</option>
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
        {isEdit && keepImages.length > 0 && (
          <div>
            <label style={labelStyle}>기존 이미지</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {keepImages.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{ width: 80, height: 100, background: `url(${img.startsWith('http') ? img : `/uploads/${img}`}) center/cover`, border: '1px solid #ecebe8' }} />
                  <button type="button" onClick={() => setKeepImages(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#b3261e', color: '#fff', border: 0, fontSize: 12, cursor: 'pointer' }}>
                    ×
                  </button>
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
        <button type="submit" disabled={submitting} style={{
          padding: '16px', fontSize: 15, fontWeight: 600, background: '#141413',
          color: '#fbfbfa', border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1
        }}>
          {submitting ? '저장 중...' : (isEdit ? '수정하기' : '등록하기')}
        </button>
      </form>
    </div>
  )
}
