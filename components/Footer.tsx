export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #ecebe8', padding: '48px clamp(16px,2.4vw,36px)',
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 32, fontSize: 14, color: '#3d3c39'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <strong style={{ color: '#141413', fontWeight: 600 }}>고객 서비스</strong>
        <span>문의하기</span><span>배송 안내</span><span>교환 및 반품</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <strong style={{ color: '#141413', fontWeight: 600 }}>회사</strong>
        <span>브랜드 소개</span><span>매장 찾기</span><span>채용</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <strong style={{ color: '#141413', fontWeight: 600 }}>법적 고지</strong>
        <span>이용약관</span><span>개인정보처리방침</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontWeight: 700, letterSpacing: '0.18em', color: '#141413' }}>글로벌득템</span>
        <span style={{ color: '#8a8984' }}>© 2026 글로벌득템</span>
      </div>
    </footer>
  )
}
