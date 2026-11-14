import { isDiscountActive } from '@/lib/discount'

interface ProductCardProps {
  product: {
    id: string
    name: string
    brand: string
    price: number
    discountPrice: number | null
    discountStart: string
    discountEnd: string
    images: string[]
    colors: string[]
    status: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = isDiscountActive(product.discountPrice, product.discountStart, product.discountEnd)
  const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice! / product.price) * 100) : 0

  return (
    <a href={`/products/${product.id}`} style={{ textDecoration: 'none', color: '#141413' }}>
      <article style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{
          position: 'relative', aspectRatio: '4/5',
          background: product.images[0]
            ? `url(${product.images[0].startsWith('http') ? product.images[0] : `/uploads/${product.images[0]}`}) center/cover`
            : 'repeating-linear-gradient(135deg, #f1f0ed 0 12px, #ecebe7 12px 24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {!product.images[0] && (
            <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: '#8a8984' }}>이미지 없음</span>
          )}
          {product.status !== '구매가능' && (
            <span style={{ position: 'absolute', left: 12, top: 12, fontSize: 13, color: '#6b6a66' }}>
              {product.status}
            </span>
          )}
          {hasDiscount && (
            <span style={{ position: 'absolute', right: 12, top: 12, fontSize: 12, fontWeight: 700, color: '#fff', background: '#c62828', padding: '3px 8px' }}>
              {discountPercent}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 clamp(4px,0.6vw,12px)' }}>
          <span style={{ fontSize: 13, color: '#6b6a66' }}>{product.brand}</span>
          <span style={{ fontSize: 15, lineHeight: 1.4 }}>{product.name}</span>
          {hasDiscount ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ fontSize: 14, color: '#c62828', fontWeight: 600 }}>₩{product.discountPrice!.toLocaleString()}</span>
              <span style={{ fontSize: 12, color: '#a3a29e', textDecoration: 'line-through' }}>₩{product.price.toLocaleString()}</span>
            </div>
          ) : (
            <span style={{ fontSize: 14, color: '#3d3c39', fontVariantNumeric: 'tabular-nums' }}>
              ₩{product.price.toLocaleString()}
            </span>
          )}
          {product.colors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              {product.colors.map((c, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1px solid #d6d5d1' }} />
              ))}
            </div>
          )}
        </div>
      </article>
    </a>
  )
}
