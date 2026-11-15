'use client'

import { useState, useEffect } from 'react'
import { getCart, removeFromCart, updateQuantity, CartItem } from '@/lib/cart'
import { isDiscountActive } from '@/lib/discount'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => { setItems(getCart()) }, [])

  function refresh() { setItems(getCart()) }

  function getItemPrice(item: CartItem): number {
    return isDiscountActive(item.discountPrice, item.discountStart, item.discountEnd)
      ? item.discountPrice! : item.price
  }

  const total = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfa' }}>
      <Header />
      <main style={{ padding: '0 clamp(16px,2.4vw,36px)', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 'clamp(24px,4vw,48px) 0 32px' }}>장바구니</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#8a8984' }}>
            <p>장바구니가 비어있습니다</p>
            <a href="/products" style={{ color: '#141413', marginTop: 16, display: 'inline-block' }}>쇼핑 계속하기</a>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid #ecebe8' }}>
              {items.map((item, i) => {
                const unitPrice = getItemPrice(item)
                const hasDiscount = isDiscountActive(item.discountPrice, item.discountStart, item.discountEnd)
                return (
                  <div key={`${item.productId}-${item.color}-${i}`} style={{
                    display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, padding: 16,
                    borderBottom: '1px solid #ecebe8', background: '#fff', alignItems: 'center'
                  }}>
                    <div style={{
                      width: 80, height: 100,
                      background: item.image
                        ? `url(${item.image.startsWith('http') ? item.image : `/uploads/${item.image}`}) center/cover`
                        : '#f1f0ed'
                    }} />
                    <div>
                      <div style={{ fontSize: 13, color: '#6b6a66' }}>{item.brand}</div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{item.name}</div>
                      {item.colorName && <div style={{ fontSize: 13, color: '#6b6a66' }}>색상: {item.colorName}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        {hasDiscount ? (
                          <>
                            <span style={{ fontSize: 14, color: '#c62828', fontWeight: 600 }}>₩{unitPrice.toLocaleString()}</span>
                            <span style={{ fontSize: 12, color: '#a3a29e', textDecoration: 'line-through' }}>₩{item.price.toLocaleString()}</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 14 }}>₩{unitPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <button onClick={() => { removeFromCart(item.productId, item.color); refresh() }}
                        style={{ background: 'none', border: 0, color: '#a3a29e', cursor: 'pointer', fontSize: 18 }}>×</button>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ecebe8' }}>
                        <button onClick={() => { updateQuantity(item.productId, item.color, item.quantity - 1); refresh() }}
                          style={{ width: 32, height: 32, background: 'none', border: 0, cursor: 'pointer', fontSize: 16 }}>−</button>
                        <span style={{ width: 32, textAlign: 'center', fontSize: 14 }}>{item.quantity}</span>
                        <button onClick={() => { updateQuantity(item.productId, item.color, item.quantity + 1); refresh() }}
                          style={{ width: 32, height: 32, background: 'none', border: 0, cursor: 'pointer', fontSize: 16 }}>+</button>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>₩{(unitPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid #ecebe8', marginBottom: 24 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>합계</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>₩{total.toLocaleString()}</span>
            </div>
            <a href="/order" style={{
              display: 'block', textAlign: 'center', padding: '16px', fontSize: 15, fontWeight: 600,
              background: '#141413', color: '#fbfbfa', textDecoration: 'none', marginBottom: 80
            }}>
              주문서 작성하기
            </a>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
