export interface CartItem {
  productId: string
  brand: string
  name: string
  price: number
  discountPrice: number | null
  discountStart: string
  discountEnd: string
  color: string
  colorName: string
  image: string
  quantity: number
}

const CART_KEY = 'global-deuktem-cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(CART_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(item: CartItem): void {
  const cart = getCart()
  const existing = cart.find(c => c.productId === item.productId && c.color === item.color)
  if (existing) {
    existing.quantity += item.quantity
  } else {
    cart.push(item)
  }
  saveCart(cart)
}

export function removeFromCart(productId: string, color: string): void {
  const cart = getCart().filter(c => !(c.productId === productId && c.color === color))
  saveCart(cart)
}

export function updateQuantity(productId: string, color: string, quantity: number): void {
  const cart = getCart()
  const item = cart.find(c => c.productId === productId && c.color === color)
  if (item) {
    item.quantity = Math.max(1, quantity)
    saveCart(cart)
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}
