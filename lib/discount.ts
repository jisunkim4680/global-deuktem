export function isDiscountActive(discountPrice: number | null, discountStart: string, discountEnd: string): boolean {
  if (!discountPrice) return false
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (discountStart) {
    const start = new Date(discountStart)
    if (today < start) return false
  }
  if (discountEnd) {
    const end = new Date(discountEnd)
    end.setHours(23, 59, 59, 999)
    if (now > end) return false
  }
  return true
}
