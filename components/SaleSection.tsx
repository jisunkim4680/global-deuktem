'use client'

interface SaleProduct {
  id: string; brand: string; name: string; price: number
  discountPrice: number | null; discountStart: string; discountEnd: string
  images: string[]
}

function imgUrl(img: string) {
  return img.startsWith('http') ? img : `/uploads/${img}`
}

function dateFmt(s: string) {
  return s.replace(/-/g, '.')
}

function period(p: SaleProduct) {
  if (p.discountStart && p.discountEnd) return `${dateFmt(p.discountStart)} — ${dateFmt(p.discountEnd)}`
  if (p.discountEnd) return `~${dateFmt(p.discountEnd)}`
  if (p.discountStart) return `${dateFmt(p.discountStart)}~`
  return ''
}

function pct(p: SaleProduct) {
  return Math.round((1 - p.discountPrice! / p.price) * 100)
}

export default function SaleSection({ products }: { products: SaleProduct[] }) {
  const cnt = products.length
  if (cnt === 0) return null

  return (
    <section style={{
      margin: '4px calc(-1 * clamp(16px,2.4vw,36px)) 0',
      background: 'linear-gradient(165deg, #0f0f0e 0%, #1a1918 50%, #141413 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute', top: -80, right: -40,
        fontSize: 'clamp(120px, 18vw, 280px)', fontWeight: 900,
        color: 'rgba(255,255,255,0.02)', letterSpacing: '-0.04em',
        lineHeight: 1, pointerEvents: 'none', userSelect: 'none'
      }}>
        SALE
      </div>

      <div style={{ padding: 'clamp(14px,1.5vw,22px) clamp(24px,3vw,48px)', position: 'relative' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 'clamp(10px,1.1vw,16px)' }}>
          <span style={{
            fontSize: 'clamp(11px,1vw,13px)', fontWeight: 600,
            color: '#d4a574', letterSpacing: '0.2em', textTransform: 'uppercase'
          }}>
            Limited Offer
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(212,165,116,0.2)' }} />
          <span style={{ fontSize: 12, color: '#6b6a66' }}>
            {cnt}개 상품
          </span>
        </div>

        {/* 1개: 시네마틱 히어로 */}
        {cnt === 1 && (() => {
          const p = products[0]
          return (
            <a href={`/products/${p.id}`} style={{ textDecoration: 'none', color: '#fbfbfa', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(20px,3vw,40px)', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  aspectRatio: '2/1',
                  background: p.images[0] ? `url(${imgUrl(p.images[0])}) center/cover` : '#2a2928',
                  boxShadow: '24px 24px 60px rgba(0,0,0,0.5)'
                }} />
                <div style={{
                  position: 'absolute', left: -12, top: 24,
                  background: '#d4a574', color: '#0f0f0e',
                  padding: '8px 20px', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em'
                }}>
                  {pct(p)}% OFF
                </div>
              </div>
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 13, color: '#8a8984', letterSpacing: '0.08em', marginBottom: 12 }}>{p.brand}</div>
                <div style={{ fontSize: 'clamp(18px,2.2vw,28px)', fontWeight: 300, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.02em' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 'clamp(18px,2vw,26px)', fontWeight: 600, color: '#d4a574' }}>₩{p.discountPrice!.toLocaleString()}</span>
                </div>
                <span style={{ fontSize: 15, color: '#6b6a66', textDecoration: 'line-through' }}>₩{p.price.toLocaleString()}</span>
                {period(p) && (
                  <div style={{ fontSize: 12, color: '#6b6a66', marginTop: 8, letterSpacing: '0.04em' }}>{period(p)}</div>
                )}
                <div style={{
                  display: 'inline-block', marginTop: 16, padding: '10px 28px',
                  border: '1px solid rgba(212,165,116,0.4)', color: '#d4a574',
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.1em',
                  transition: 'all 0.3s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#d4a574'; e.currentTarget.style.color = '#0f0f0e' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d4a574' }}
                >
                  SHOP NOW
                </div>
              </div>
            </a>
          )
        })()}

        {/* 2개: 에디토리얼 2단 */}
        {cnt === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px,2vw,28px)' }}>
            {products.map((p, i) => (
              <a key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', color: '#fbfbfa', position: 'relative', marginTop: i === 1 ? 20 : 0 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    aspectRatio: '2/1',
                    background: p.images[0] ? `url(${imgUrl(p.images[0])}) center/cover` : '#2a2928',
                  }} />
                  <div style={{
                    position: 'absolute', left: 0, bottom: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    padding: '40px 16px 16px'
                  }}>
                    <span style={{ fontSize: 20, color: '#d4a574', fontWeight: 700 }}>{pct(p)}%</span>
                  </div>
                </div>
                <div style={{ padding: '10px 0' }}>
                  <div style={{ fontSize: 12, color: '#8a8984', letterSpacing: '0.06em', marginBottom: 6 }}>{p.brand}</div>
                  <div style={{ fontSize: 16, fontWeight: 400, marginBottom: 10 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#d4a574' }}>₩{p.discountPrice!.toLocaleString()}</span>
                    <span style={{ fontSize: 13, color: '#6b6a66', textDecoration: 'line-through' }}>₩{p.price.toLocaleString()}</span>
                  </div>
                  {period(p) && <div style={{ fontSize: 11, color: '#6b6a66', marginTop: 6 }}>{period(p)}</div>}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* 3개+: 가로 스크롤 카드 */}
        {cnt >= 3 && (
          <div style={{
            display: 'flex', gap: 'clamp(12px,1.6vw,24px)',
            overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8,
            margin: '0 calc(-1 * clamp(24px,3vw,48px))', padding: '0 clamp(24px,3vw,48px) 8px'
          }}>
            {products.map(p => (
              <a key={p.id} href={`/products/${p.id}`} style={{
                textDecoration: 'none', color: '#fbfbfa', flexShrink: 0,
                width: 'clamp(140px, 15vw, 190px)'
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    aspectRatio: '2/1',
                    background: p.images[0] ? `url(${imgUrl(p.images[0])}) center/cover` : '#2a2928',
                  }} />
                  <div style={{
                    position: 'absolute', right: 8, top: 8,
                    background: '#d4a574', color: '#0f0f0e',
                    padding: '4px 10px', fontSize: 12, fontWeight: 700
                  }}>
                    -{pct(p)}%
                  </div>
                </div>
                <div style={{ padding: '12px 0' }}>
                  <div style={{ fontSize: 11, color: '#8a8984', letterSpacing: '0.06em', marginBottom: 4 }}>{p.brand}</div>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#d4a574' }}>₩{p.discountPrice!.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: '#6b6a66', textDecoration: 'line-through' }}>₩{p.price.toLocaleString()}</span>
                  </div>
                  {period(p) && <div style={{ fontSize: 10, color: '#6b6a66', marginTop: 4 }}>{period(p)}</div>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
