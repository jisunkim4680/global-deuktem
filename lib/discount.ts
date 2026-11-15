export function isDiscountActive(discountPrice: number | null, discountStart: string, discountEnd: string): boolean {
  if (!discountPrice) return false
  // YYYY-MM-DD 문자열 비교로 타임존 문제 방지
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  if (discountStart && todayStr < discountStart) return false
  if (discountEnd && todayStr > discountEnd) return false
  return true
}
