import Footer from '@/components/Footer'
import AnnouncementBar from '@/components/AnnouncementBar'

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfa' }}>
      <AnnouncementBar />
      {children}
      <Footer />
    </div>
  )
}
