import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '글로벌득템',
  description: '글로벌득템 - 상품 카탈로그',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
