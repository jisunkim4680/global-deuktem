'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SideMenu from './SideMenu'
import { getCartCount } from '@/lib/cart'

interface HeaderProps {
  isAdmin?: boolean
  onSearch?: (query: string) => void
  showSearch?: boolean
}

export default function Header({ isAdmin, onSearch, showSearch }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    setCartCount(getCartCount())
    const interval = setInterval(() => setCartCount(getCartCount()), 1000)
    return () => clearInterval(interval)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(251,251,250,0.96)', backdropFilter: 'blur(8px)',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: 'clamp(14px,2.4vw,26px) clamp(16px,2vw,28px)',
        borderBottom: '1px solid #ecebe8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 0, padding: '8px 0', fontSize: 15, cursor: 'pointer' }}>
            메뉴
          </button>
        </div>
        <a href="/products" style={{ textDecoration: 'none', color: '#141413', fontSize: 'clamp(20px,3.2vw,36px)', fontWeight: 700, letterSpacing: '0.18em', whiteSpace: 'nowrap', paddingLeft: '0.18em' }}>
          글로벌득템
        </a>
        <nav style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'clamp(10px,1.8vw,24px)', fontSize: 15 }}>
          {showSearch && (
            <input
              type="text" placeholder="검색..." value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); onSearch?.(e.target.value) }}
              style={{ padding: '8px 12px', border: '1px solid #ecebe8', fontSize: 13, outline: 'none', width: 'clamp(100px,14vw,180px)' }}
            />
          )}
          {!isAdmin && (
            <a href="/cart" style={{ textDecoration: 'none', color: '#141413', fontSize: 15, display: 'flex', gap: 4 }}>
              장바구니{cartCount > 0 && <span style={{ fontVariantNumeric: 'tabular-nums' }}>({cartCount})</span>}
            </a>
          )}
          <button onClick={handleLogout} style={{ background: 'none', border: 0, padding: '8px 0', fontSize: 15, cursor: 'pointer' }}>
            로그아웃
          </button>
        </nav>
      </header>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} isAdmin={isAdmin} />
    </>
  )
}
