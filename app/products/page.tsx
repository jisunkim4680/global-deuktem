'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/ProductGrid'
import ProductCard from '@/components/ProductCard'
import { isDiscountActive } from '@/lib/discount'

interface Product {
  id: string; name: string; brand: string; price: number; category: string
  discountPrice: number | null; discountStart: string; discountEnd: string
  images: string[]; colors: string[]; status: string
}

const ALL_CATEGORIES = ['가방', '옷', '신발', '지갑', '액세서리', '키링']

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(categoryParam || '전체')
  const [activeBrand, setActiveBrand] = useState('')
  const [sort, setSort] = useState<'low' | 'high'>('low')
  const [showCount, setShowCount] = useState(30)

  // 전체 상품을 한번 불러와서 카테고리별 존재 여부 확인
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setAllProducts)
  }, [])

  const visibleCategories = ['전체', ...ALL_CATEGORIES.filter(cat => allProducts.some(p => p.category === cat))]

  // 브랜드 목록 (카테고리 선택 시 해당 카테고리, 전체일 때 모든 브랜드)
  const categoryBrands = activeCategory !== '전체'
    ? [...new Set(allProducts.filter(p => p.category === activeCategory).map(p => p.brand))].sort()
    : [...new Set(allProducts.map(p => p.brand))].sort()

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (activeCategory !== '전체') params.set('category', activeCategory)
    if (activeBrand) params.set('brand', activeBrand)
    fetch(`/api/products?${params}`).then(r => r.json()).then(setProducts)
  }, [search, activeCategory, activeBrand])

  const sorted = [...products].sort((a, b) => sort === 'low' ? a.price - b.price : b.price - a.price)

  const discountProducts = allProducts.filter(p => isDiscountActive(p.discountPrice, p.discountStart, p.discountEnd))

  return (
    <>
      {discountProducts.length > 0 && activeCategory === '전체' && !activeBrand && !search && (
        <div style={{ margin: 'clamp(24px,3.6vw,52px) 0 0', padding: 'clamp(24px,3vw,40px)', background: '#141413', marginLeft: 'calc(-1 * clamp(16px,2.4vw,36px))', marginRight: 'calc(-1 * clamp(16px,2.4vw,36px))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'clamp(16px,2vw,28px)' }}>
            <h2 style={{ fontSize: 'clamp(18px,1.8vw,24px)', fontWeight: 700, color: '#fbfbfa', margin: 0 }}>SALE</h2>
            <span style={{ fontSize: 13, color: '#a3a29e' }}>{discountProducts.length}개 상품 할인 중</span>
          </div>
          <div style={{
            display: 'grid', gridAutoFlow: 'column',
            gridAutoColumns: 'minmax(200px, 240px)', gap: 'clamp(8px,1vw,16px)',
            overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8
          }}>
            {discountProducts.map(p => (
              <a key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', color: '#fbfbfa' }}>
                <div style={{
                  aspectRatio: '4/5',
                  background: p.images[0]
                    ? `url(${p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`}) center/cover`
                    : '#3d3c39',
                  marginBottom: 10
                }} />
                <div style={{ fontSize: 13, color: '#a3a29e' }}>{p.brand}</div>
                <div style={{ fontSize: 14 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 14, color: '#ff4444', fontWeight: 700 }}>
                    {Math.round((1 - p.discountPrice! / p.price) * 100)}%
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>₩{p.discountPrice!.toLocaleString()}</span>
                  <span style={{ fontSize: 12, color: '#6b6a66', textDecoration: 'line-through' }}>₩{p.price.toLocaleString()}</span>
                </div>
                {(p.discountStart || p.discountEnd) && (
                  <div style={{ fontSize: 11, color: '#6b6a66', marginTop: 4 }}>
                    {p.discountStart && p.discountEnd
                      ? `${p.discountStart.replace(/-/g, '.')} ~ ${p.discountEnd.replace(/-/g, '.')}`
                      : p.discountEnd ? `~${p.discountEnd.replace(/-/g, '.')}까지` : `${p.discountStart.replace(/-/g, '.')}~`}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 'clamp(22px,2.2vw,28px)', fontWeight: 500, letterSpacing: '-0.02em', margin: 'clamp(24px,3.6vw,52px) 0 clamp(20px,3vw,40px)' }}>
        {activeCategory === '전체' ? '전체 상품' : activeCategory}
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 'clamp(20px,2.4vw,36px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(18px,2.6vw,40px)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {visibleCategories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setActiveBrand(''); setShowCount(30) }}
              style={{
                background: 'none', border: 'none', padding: '6px 0',
                fontSize: 'clamp(15px,1.3vw,19px)', whiteSpace: 'nowrap', cursor: 'pointer',
                color: cat === activeCategory ? '#141413' : '#6b6a66',
                borderBottom: cat === activeCategory ? '1px solid #141413' : '1px solid transparent'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        {categoryBrands.length > 0 && (
          <div style={{ display: 'flex', gap: 'clamp(12px,2vw,24px)', overflowX: 'auto', scrollbarWidth: 'none', width: '100%' }}>
            <button
              onClick={() => setActiveBrand('')}
              style={{
                background: 'none', border: 'none', padding: '4px 0', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                color: !activeBrand ? '#141413' : '#a3a29e', fontWeight: !activeBrand ? 600 : 400
              }}
            >
              전체
            </button>
            {categoryBrands.map(brand => (
              <button
                key={brand}
                onClick={() => { setActiveBrand(activeBrand === brand ? '' : brand); setShowCount(30) }}
                style={{
                  background: 'none', border: 'none', padding: '4px 0', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                  color: activeBrand === brand ? '#141413' : '#a3a29e', fontWeight: activeBrand === brand ? 600 : 400
                }}
              >
                {brand}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,2.4vw,36px)', marginLeft: 'auto' }}>
          <input
            type="text" placeholder="검색..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #ecebe8', fontSize: 14, outline: 'none', width: 160 }}
          />
          <span style={{ fontSize: 15, color: '#3d3c39' }}>{sorted.length} 제품</span>
          <div style={{ display: 'flex', border: '1px solid #141413' }}>
            {([['low', '낮은 가격순'], ['high', '높은 가격순']] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setSort(v)}
                style={{
                  background: sort === v ? '#141413' : '#fbfbfa',
                  color: sort === v ? '#fbfbfa' : '#141413',
                  border: 0, padding: '13px 20px', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProductGrid products={sorted.slice(0, showCount)} />
      {sorted.length > showCount && (
        <div style={{ textAlign: 'center', padding: '32px 0 80px' }}>
          <button
            onClick={() => setShowCount(prev => prev + 30)}
            style={{
              padding: '14px 48px', fontSize: 15, background: '#fff',
              color: '#141413', border: '1px solid #141413', cursor: 'pointer'
            }}
          >
            더보기 ({sorted.length - showCount}개 남음)
          </button>
        </div>
      )}
    </>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#8a8984' }}>로딩 중...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
