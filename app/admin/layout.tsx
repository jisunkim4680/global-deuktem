import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfa' }}>
      <Header isAdmin />
      <main style={{ padding: '0 clamp(16px,2.4vw,36px)' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
