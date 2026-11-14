import ProductCard from './ProductCard'

interface Product {
  id: string; name: string; brand: string; price: number
  images: string[]; colors: string[]; status: string
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
      gap: 'clamp(24px,3vw,44px) clamp(8px,1vw,24px)',
      paddingBottom: 80
    }}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
      {products.length === 0 && (
        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#8a8984', padding: 60 }}>
          상품이 없습니다
        </p>
      )}
    </div>
  )
}
