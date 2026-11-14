'use client'

import { useEffect, useState } from 'react'

interface Product {
  id: string; name: string; brand: string; price: number; category: string
  images: string[]; visible: boolean; status: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [bulkMsg, setBulkMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setBulkMsg('')

    const fd = new FormData()
    fd.append('csv', file)

    const res = await fetch('/api/products/bulk', { method: 'POST', body: fd })
    const data = await res.json()

    if (res.ok) {
      setBulkMsg(`${data.added}개 상품 등록 완료!${data.errors.length ? ` (오류 ${data.errors.length}건)` : ''}`)
      fetch('/api/products').then(r => r.json()).then(setProducts)
    } else {
      setBulkMsg(data.error || '업로드 실패')
    }
    setUploading(false)
    e.target.value = ''
  }

  async function toggleVisible(id: string, visible: boolean) {
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !visible })
    })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, visible: !visible } : p))
  }

  async function toggleStatus(id: string, status: string) {
    const next = status === '구매가능' ? '품절' : '구매가능'
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: next } : p))
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>상품 관리</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{
            background: '#fff', color: '#141413', padding: '12px 24px',
            fontSize: 14, fontWeight: 600, border: '1px solid #141413', cursor: 'pointer',
            opacity: uploading ? 0.6 : 1
          }}>
            {uploading ? '업로드 중...' : 'CSV 대량 등록'}
            <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
          <a href="/admin/products/new" style={{
            background: '#141413', color: '#fbfbfa', padding: '12px 24px',
            textDecoration: 'none', fontSize: 14, fontWeight: 600
          }}>
            + 상품 등록
          </a>
        </div>
      </div>
      {bulkMsg && <p style={{ padding: 12, background: '#f1f0ed', fontSize: 13, marginBottom: 16 }}>{bulkMsg}</p>}
      {products.length === 0 && (
        <p style={{ textAlign: 'center', color: '#8a8984', padding: 60 }}>등록된 상품이 없습니다</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: products.length ? '1px solid #ecebe8' : 'none' }}>
        {products.map(p => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr auto',
            alignItems: 'center', gap: 16, padding: 16,
            borderBottom: '1px solid #ecebe8', background: '#fff'
          }}>
            <div style={{
              width: 60, height: 75,
              background: p.images[0]
                ? `url(${p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`}) center/cover`
                : '#f1f0ed'
            }} />
            <div>
              <div style={{ fontSize: 13, color: '#6b6a66' }}>{p.brand} · {p.category}</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 14, color: '#3d3c39' }}>₩{p.price.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => toggleVisible(p.id, p.visible)} style={{
                padding: '6px 12px', fontSize: 12, cursor: 'pointer', border: '1px solid #ecebe8',
                background: p.visible ? '#141413' : '#fff', color: p.visible ? '#fbfbfa' : '#141413'
              }}>
                {p.visible ? '전시중' : '숨김'}
              </button>
              <button onClick={() => toggleStatus(p.id, p.status)} style={{
                padding: '6px 12px', fontSize: 12, cursor: 'pointer', border: '1px solid #ecebe8',
                background: p.status === '구매가능' ? '#fff' : '#b3261e', color: p.status === '구매가능' ? '#141413' : '#fff'
              }}>
                {p.status}
              </button>
              <a href={`/admin/products/${p.id}/edit`} style={{
                padding: '6px 12px', fontSize: 12, border: '1px solid #ecebe8', textDecoration: 'none', color: '#141413'
              }}>
                수정
              </a>
              <button onClick={() => handleDelete(p.id)} style={{
                padding: '6px 12px', fontSize: 12, cursor: 'pointer', border: '1px solid #b3261e',
                background: 'none', color: '#b3261e'
              }}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
