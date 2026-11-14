'use client'

import { useState } from 'react'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div style={{
      position: 'relative', background: '#141413', color: '#fbfbfa',
      fontSize: 13, letterSpacing: '-0.01em', padding: '12px 48px',
      textAlign: 'center', lineHeight: 1.5
    }}>
      글로벌득템에서 전 세계 인기 상품을 만나보세요.
      <button
        onClick={() => setVisible(false)}
        aria-label="닫기"
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 0, color: '#fbfbfa', fontSize: 20,
          lineHeight: 1, cursor: 'pointer', width: 36, height: 36
        }}
      >
        ×
      </button>
    </div>
  )
}
