'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import AdminProductForm from '@/components/AdminProductForm'

function EditContent() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct)
  }, [id])

  if (!product) return <div style={{ padding: 60, textAlign: 'center', color: '#8a8984' }}>로딩 중...</div>

  return <AdminProductForm initialData={product} />
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#8a8984' }}>로딩 중...</div>}>
      <EditContent />
    </Suspense>
  )
}
