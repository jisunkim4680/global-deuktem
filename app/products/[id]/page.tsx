'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { COLOR_PRESETS } from '@/lib/colors'
import { isDiscountActive } from '@/lib/discount'
import { addToCart } from '@/lib/cart'

interface Product {
  id: string; name: string; brand: string; size: string
  relatedProducts: string[]
  price: number; discountPrice: number | null; discountStart: string; discountEnd: string
  reservationStart: string; reservationEnd: string; category: string
  description: string; descriptionAlign: string
  images: string[]; colors: string[]; options: any[]; status: string
}

function ProductContent() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedSizes, setRelatedSizes] = useState<Product[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState('')
  const [addedMsg, setAddedMsg] = useState('')

  useEffect(() => {
    fetch(`/api/products/${id}`, { credentials: 'include' }).then(r => r.json()).then((p: Product) => {
      setProduct(p)
      setActiveImage(0)
      if (p.relatedProducts && p.relatedProducts.length > 0) {
        Promise.all(
          p.relatedProducts.map(rid =>
            fetch(`/api/products/${rid}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null)
          )
        ).then(results => setRelatedSizes(results.filter(Boolean)))
      } else {
        setRelatedSizes([])
      }
    })
  }, [id])

  const handleSearch = (q: string) => { if (q) router.push(`/products?search=${encodeURIComponent(q)}`) }

  if (!product) return <><Header showSearch onSearch={handleSearch} /><div style={{ padding: 60, textAlign: 'center', color: '#8a8984' }}>로딩 중...</div></>

  return (
    <>
    <Header showSearch onSearch={handleSearch} />
    <main style={{ padding: '0 clamp(16px,2.4vw,36px)' }}>
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
            position: 'relative', aspectRatio: '4/5',
            background: product.images[activeImage]
              ? `url(${product.images[activeImage].startsWith('http') ? product.images[activeImage] : `/uploads/${product.images[activeImage]}`}) center/cover`
              : 'repeating-linear-gradient(135deg, #f1f0ed 0 12px, #ecebe7 12px 24px)',
            marginBottom: 12, cursor: product.images.length > 1 ? 'pointer' : 'default'
          }}
            onClick={(e) => {
              if (product.images.length <= 1) return
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              if (x < rect.width / 2) {
                setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)
              } else {
                setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)
              }
            }}
          >
            {product.images.length > 1 && (
              <>
                {activeImage > 0 && (
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#141413', pointerEvents: 'none' }}>‹</div>
                )}
                {activeImage < product.images.length - 1 && (
                  <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#141413', pointerEvents: 'none' }}>›</div>
                )}
              </>
            )}
          </div>
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
          {isDiscountActive(product.discountPrice, product.discountStart, product.discountEnd) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ fontSize: 20, color: '#c62828', fontWeight: 600 }}>₩{product.discountPrice!.toLocaleString()}</span>
              <span style={{ fontSize: 15, color: '#a3a29e', textDecoration: 'line-through' }}>₩{product.price.toLocaleString()}</span>
              <span style={{ fontSize: 13, color: '#c62828', fontWeight: 700 }}>
                {Math.round((1 - product.discountPrice! / product.price) * 100)}%
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>₩{product.price.toLocaleString()}</span>
          )}
          {product.discountEnd && isDiscountActive(product.discountPrice, product.discountStart, product.discountEnd) && (
            <span style={{ fontSize: 12, color: '#6b6a66' }}>~{product.discountEnd}까지</span>
          )}
          {product.status !== '구매가능' && (
            <div>
              <span style={{ fontSize: 14, color: product.status === '예약중' ? '#2b5797' : '#b3261e', fontWeight: 600 }}>{product.status}</span>
              {product.status === '예약중' && (product.reservationStart || product.reservationEnd) && (
                <span style={{ fontSize: 13, color: '#6b6a66', marginLeft: 8 }}>
                  {product.reservationStart && product.reservationEnd
                    ? `${product.reservationStart.replace(/-/g, '.')} ~ ${product.reservationEnd.replace(/-/g, '.')}`
                    : product.reservationEnd ? `~${product.reservationEnd.replace(/-/g, '.')}` : `${product.reservationStart.replace(/-/g, '.')}~`}
                </span>
              )}
            </div>
          )}
          {product.colors.length > 0 && (
            <div>
              <span style={{ fontSize: 13, color: '#6b6a66', marginBottom: 8, display: 'block' }}>색상</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {product.colors.map((c, i) => {
                  const preset = COLOR_PRESETS.find(p => p.hex === c)
                  const isSelected = selectedColor === c
                  return (
                    <button key={i} type="button" onClick={() => setSelectedColor(c)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: isSelected ? '2px solid #141413' : '1px solid #d6d5d1', outline: isSelected ? '2px solid #fff' : 'none', outlineOffset: -3 }} />
                      <span style={{ fontSize: 11, color: isSelected ? '#141413' : '#6b6a66', fontWeight: isSelected ? 600 : 400 }}>{preset?.name || c}</span>
                    </button>
                  )
                })}
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

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #ecebe8' }}>
            {addedMsg && <p style={{ fontSize: 13, color: '#3f6b3f', marginBottom: 12 }}>{addedMsg}</p>}
            <button
              onClick={() => {
                const preset = COLOR_PRESETS.find(p => p.hex === selectedColor)
                const hasDiscount = isDiscountActive(product.discountPrice, product.discountStart, product.discountEnd)
                addToCart({
                  productId: product.id,
                  brand: product.brand,
                  name: product.name,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  discountStart: product.discountStart,
                  discountEnd: product.discountEnd,
                  color: selectedColor,
                  colorName: preset?.name || selectedColor || '',
                  image: product.images[0] || '',
                  quantity: 1
                })
                setAddedMsg('장바구니에 담았습니다')
                setTimeout(() => setAddedMsg(''), 2000)
              }}
              style={{
                width: '100%', padding: '16px', fontSize: 15, fontWeight: 600,
                background: '#141413', color: '#fbfbfa', border: 'none', cursor: 'pointer'
              }}
            >
              장바구니 담기
            </button>
          </div>
        </div>
      </div>

      {relatedSizes.length > 0 && (
        <div style={{ marginTop: 'clamp(40px,6vw,80px)', borderTop: '1px solid #ecebe8', paddingTop: 'clamp(24px,4vw,48px)' }}>
          <div style={{ display: 'flex', gap: 32, marginBottom: 'clamp(20px,3vw,36px)' }}>
            <h2 style={{ fontSize: 'clamp(16px,1.4vw,20px)', fontWeight: 700, borderBottom: '2px solid #141413', paddingBottom: 8 }}>
              연관 상품
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(relatedSizes.length, 4)}, minmax(140px, 220px))`, gap: 'clamp(12px,2vw,24px)' }}>
            {relatedSizes.map(item => (
              <a key={item.id} href={`/products/${item.id}`} style={{ textDecoration: 'none', color: '#141413' }}>
                <div style={{
                  aspectRatio: '4/5',
                  background: item.images[0]
                    ? `url(${item.images[0].startsWith('http') ? item.images[0] : `/uploads/${item.images[0]}`}) center/cover`
                    : 'repeating-linear-gradient(135deg, #f1f0ed 0 12px, #ecebe7 12px 24px)',
                  marginBottom: 10, border: '1px solid #ecebe8'
                }} />
                <div style={{ fontSize: 13, color: '#6b6a66', textAlign: 'center' }}>{item.brand}</div>
                <div style={{ fontSize: 14, textAlign: 'center' }}>{item.name}</div>
                <div style={{ fontSize: 13, color: '#3d3c39', textAlign: 'center', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                  {isDiscountActive(item.discountPrice, item.discountStart, item.discountEnd) ? (
                    <><span style={{ color: '#c62828', fontWeight: 600 }}>₩{item.discountPrice!.toLocaleString()}</span> <span style={{ fontSize: 11, color: '#a3a29e', textDecoration: 'line-through' }}>₩{item.price.toLocaleString()}</span></>
                  ) : (
                    <>₩{item.price.toLocaleString()}</>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
    </main>
    </>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#8a8984' }}>로딩 중...</div>}>
      <ProductContent />
    </Suspense>
  )
}
