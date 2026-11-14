'use client'

interface SideMenuProps {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

export default function SideMenu({ open, onClose, isAdmin }: SideMenuProps) {
  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,20,19,0.35)', zIndex: 40 }} />
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 'min(400px, 88vw)', background: '#fbfbfa', zIndex: 41,
        padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 28
      }}>
        <button onClick={onClose} style={{ alignSelf: 'flex-start', background: 'none', border: 0, fontSize: 15, padding: '8px 0', cursor: 'pointer' }}>
          닫기 ×
        </button>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 22, letterSpacing: '-0.02em' }}>
          <a href="/products" style={{ textDecoration: 'none' }}>전체 상품</a>
          <a href="/products?category=가방" style={{ textDecoration: 'none' }}>가방</a>
          <a href="/products?category=옷" style={{ textDecoration: 'none' }}>옷</a>
          <a href="/products?category=신발" style={{ textDecoration: 'none' }}>신발</a>
          <a href="/products?category=액세서리" style={{ textDecoration: 'none' }}>액세서리</a>
        </nav>
        {isAdmin && (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, color: '#3d3c39', borderTop: '1px solid #ecebe8', paddingTop: 20 }}>
            <a href="/admin" style={{ textDecoration: 'none', color: '#3d3c39' }}>관리자 대시보드</a>
            <a href="/admin/products/new" style={{ textDecoration: 'none', color: '#3d3c39' }}>상품 등록</a>
            <a href="/admin/settings" style={{ textDecoration: 'none', color: '#3d3c39' }}>설정</a>
          </nav>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, color: '#3d3c39' }}>
          <span>고객 서비스</span>
        </div>
      </aside>
    </>
  )
}
