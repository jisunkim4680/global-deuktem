'use client'

import { useState, useEffect } from 'react'
import { getCart, clearCart, CartItem } from '@/lib/cart'
import { isDiscountActive } from '@/lib/discount'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function OrderPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [nickname, setNickname] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [customsCode, setCustomsCode] = useState('')
  const [zonecode, setZonecode] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [memo, setMemo] = useState('')
  const [copied, setCopied] = useState(false)
  const [orderText, setOrderText] = useState('')

  useEffect(() => { setItems(getCart()) }, [])

  function openPostcode() {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.onload = () => {
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          setZonecode(data.zonecode)
          setAddress(data.roadAddress || data.jibunAddress)
        }
      }).open()
    }
    document.body.appendChild(script)
  }

  function getItemPrice(item: CartItem): number {
    return isDiscountActive(item.discountPrice, item.discountStart, item.discountEnd)
      ? item.discountPrice! : item.price
  }

  const total = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)

  function generateOrderText(): string {
    const lines = [
      '═══════════════════',
      '📋 글로벌득템 주문서',
      '═══════════════════',
      '',
      '▶ 주문자 정보',
      `닉네임: ${nickname}`,
      `이름: ${name}`,
      `연락처: ${phone}`,
      `통관부호: ${customsCode}`,
      `주소: (${zonecode}) ${address} ${addressDetail}`.trim(),
      ...(memo ? [`메모: ${memo}`] : []),
      '',
      '▶ 주문 상품',
      ...items.map((item, i) => {
        const price = getItemPrice(item)
        return [
          `${i + 1}. ${item.brand} - ${item.name}`,
          ...(item.colorName ? [`   색상: ${item.colorName}`] : []),
          `   수량: ${item.quantity}개`,
          `   금액: ₩${(price * item.quantity).toLocaleString()}`
        ].join('\n')
      }),
      '',
      '───────────────────',
      `합계: ₩${total.toLocaleString()}`,
      '═══════════════════',
    ]
    return lines.join('\n')
  }

  function handleGenerate() {
    if (!nickname || !name || !phone || !customsCode || !address || !addressDetail) {
      alert('닉네임, 이름, 연락처, 통관부호, 주소를 모두 입력해주세요')
      return
    }
    setOrderText(generateOrderText())
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(orderText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClearAndGo() {
    clearCart()
    window.location.href = '/products'
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', fontSize: 14, border: '1px solid #ecebe8', outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#3d3c39', marginBottom: 6, display: 'block' }

  if (items.length === 0 && !orderText) {
    return (
      <div style={{ minHeight: '100vh', background: '#fbfbfa' }}>
        <Header />
        <main style={{ padding: '60px clamp(16px,2.4vw,36px)', textAlign: 'center', color: '#8a8984' }}>
          <p>장바구니가 비어있습니다</p>
          <a href="/products" style={{ color: '#141413', marginTop: 16, display: 'inline-block' }}>쇼핑 계속하기</a>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfa' }}>
      <Header />
      <main style={{ padding: '0 clamp(16px,2.4vw,36px)', maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 'clamp(24px,4vw,48px) 0 32px' }}>주문서 작성</h1>

        {!orderText ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>
            <div style={{ border: '1px solid #ecebe8', padding: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>주문 상품 ({items.length}개)</h2>
              {items.map((item, i) => {
                const price = getItemPrice(item)
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: i > 0 ? '1px solid #ecebe8' : 'none' }}>
                    <div style={{
                      width: 48, height: 60, flexShrink: 0,
                      background: item.image ? `url(${item.image.startsWith('http') ? item.image : `/uploads/${item.image}`}) center/cover` : '#f1f0ed'
                    }} />
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <div style={{ color: '#6b6a66' }}>{item.brand}</div>
                      <div style={{ fontWeight: 500 }}>{item.name}{item.colorName ? ` · ${item.colorName}` : ''}</div>
                      <div>₩{price.toLocaleString()} × {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>₩{(price * item.quantity).toLocaleString()}</div>
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #ecebe8', marginTop: 8 }}>
                <span style={{ fontWeight: 600 }}>합계</span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>₩{total.toLocaleString()}</span>
              </div>
            </div>

            <div><label style={labelStyle}>닉네임 *</label><input style={inputStyle} value={nickname} onChange={e => setNickname(e.target.value)} placeholder="닉네임" /></div>
            <div><label style={labelStyle}>이름 *</label><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" /></div>
            <div><label style={labelStyle}>연락처 *</label><input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678" /></div>
            <div><label style={labelStyle}>통관부호 *</label><input style={inputStyle} value={customsCode} onChange={e => setCustomsCode(e.target.value)} placeholder="P123456789012" /></div>
            <div>
              <label style={labelStyle}>주소 *</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={zonecode ? `(${zonecode}) ${address}` : ''} readOnly placeholder="우편번호 검색을 클릭하세요" />
                <button type="button" onClick={openPostcode} style={{
                  padding: '12px 20px', fontSize: 14, background: '#141413', color: '#fbfbfa',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                }}>
                  우편번호 검색
                </button>
              </div>
              <input style={inputStyle} value={addressDetail} onChange={e => setAddressDetail(e.target.value)} placeholder="상세주소 입력 (동/호수 등)" />
            </div>
            <div><label style={labelStyle}>메모 (선택)</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={memo} onChange={e => setMemo(e.target.value)} placeholder="요청사항이 있으면 입력해주세요" /></div>

            <button onClick={handleGenerate} style={{
              padding: '16px', fontSize: 15, fontWeight: 600,
              background: '#141413', color: '#fbfbfa', border: 'none', cursor: 'pointer'
            }}>
              주문서 생성하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>
            <pre style={{
              background: '#fff', border: '1px solid #ecebe8', padding: 20,
              fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'Pretendard, sans-serif'
            }}>
              {orderText}
            </pre>
            <button onClick={handleCopy} style={{
              padding: '16px', fontSize: 15, fontWeight: 600,
              background: copied ? '#3f6b3f' : '#141413', color: '#fbfbfa', border: 'none', cursor: 'pointer'
            }}>
              {copied ? '복사 완료! 카톡에 붙여넣기 하세요' : '주문서 복사하기'}
            </button>
            <button onClick={handleClearAndGo} style={{
              padding: '16px', fontSize: 15, fontWeight: 600,
              background: '#fff', color: '#141413', border: '1px solid #ecebe8', cursor: 'pointer'
            }}>
              장바구니 비우고 쇼핑 계속하기
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
