'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'

interface Product {
  id: string; name: string; brand: string; price: number; category: string
  description: string; descriptionAlign: string
  images: string[]; colors: string[]; options: any[]; status: string
}

function ProductContent() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct)
  }, [id])

  if (!product) return <div style={{ padding: 60, textAlign: 'center', color: '#8a8984' }}>로딩 중...</div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,60px) 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14, marginBottom: 24 }}>
        <a href="/products" style={{ textDecoration: 'none', color: '#6b6a66' }}>전체 상품</a>
        <span style={{ color: '#a3a29e' }}>›</span>
        <a href={`/products?category=${product.category}`} style={{ textDecoration: 'none', color: '#6b6a66' }}>{product.category}</a>
        <span style={{ color: '#a3a29e' }}>›</span>
        <span style={{ fontWeight: 600 }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 'clamp(24px,4vw,60px)' }}>
        <div>
          <div style={{
            aspectRatio: '4/5',
            background: product.images[activeImage]
              ? `url(${product.images[activeImage].startsWith('http') ? product.images[activeImage] : `/uploads/${product.images[activeImage]}`}) center/cover`
              : 'repeating-linear-gradient(135deg, #f1f0ed 0 12px, #ecebe7 12px 24px)',
            marginBottom: 12
          }} />
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {product.images.map((img, i) => (
                <button
                  key={i} onClick={() => setActiveImage(i)}
                  style={{
                    width: 64, height: 80, border: i === activeImage ? '2px solid #141413' : '1px solid #ecebe8',
                    background: `url(${img.startsWith('http') ? img : `/uploads/${img}`}) center/cover`, cursor: 'pointer', flexShrink: 0, padding: 0
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 14, color: '#6b6a66' }}>{product.brand}</span>
          <h1 style={{ fontSize: 'clamp(22px,2.2vw,28px)', fontWeight: 500, margin: 0 }}>{product.name}</h1>
          <span style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>₩{product.price.toLocaleString()}</span>
          {product.status !== '구매가능' && (
            <span style={{ fontSize: 14, color: '#b3261e', fontWeight: 600 }}>{product.status}</span>
          )}
          {product.colors.length > 0 && (
            <div>
              <span style={{ fontSize: 13, color: '#6b6a66', marginBottom: 8, display: 'block' }}>색상</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {product.colors.map((c, i) => (
                  <span key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '1px solid #d6d5d1' }} />
                ))}
              </div>
            </div>
          )}
          {product.description && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ecebe8' }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#3d3c39', textAlign: product.descriptionAlign as any, whiteSpace: 'pre-wrap' }}>
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#8a8984' }}>로딩 중...</div>}>
      <ProductContent />
    </Suspense>
  )
}
