'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/ProductGrid'

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
  const [sort, setSort] = useState<'low' | 'high'>('low')

  // 전체 상품을 한번 불러와서 카테고리별 존재 여부 확인
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setAllProducts)
  }, [])

  const visibleCategories = ['전체', ...ALL_CATEGORIES.filter(cat => allProducts.some(p => p.category === cat))]

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (activeCategory !== '전체') params.set('category', activeCategory)
    fetch(`/api/products?${params}`).then(r => r.json()).then(setProducts)
  }, [search, activeCategory])

  const sorted = [...products].sort((a, b) => sort === 'low' ? a.price - b.price : b.price - a.price)

  return (
    <>
      <h1 style={{ fontSize: 'clamp(22px,2.2vw,28px)', fontWeight: 500, letterSpacing: '-0.02em', margin: 'clamp(24px,3.6vw,52px) 0 clamp(20px,3vw,40px)' }}>
        {activeCategory === '전체' ? '전체 상품' : activeCategory}
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 'clamp(20px,2.4vw,36px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(18px,2.6vw,40px)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {visibleCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
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

      <ProductGrid products={sorted} />
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
