import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnnouncementBar from '@/components/AnnouncementBar'

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfa' }}>
      <AnnouncementBar />
      <Header />
      <main style={{ padding: '0 clamp(16px,2.4vw,36px)' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
