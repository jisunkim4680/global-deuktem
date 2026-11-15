import { put, list, del } from '@vercel/blob'

export interface Product {
  id: string
  category: string
  brand: string
  name: string
  size: string
  relatedProducts: string[]
  price: number
  discountPrice: number | null
  discountStart: string
  discountEnd: string
  description: string
  descriptionAlign: string
  colors: string[]
  options: any[]
  images: string[]
  visible: boolean
  status: string
  createdAt: string
  updatedAt: string
}

const PRODUCTS_KEY = 'data/products.json'
const CONFIG_KEY = 'data/config.json'

// 최신 blob URL 캐시
const blobUrlCache = new Map<string, string>()

async function getBlobUrl(key: string): Promise<string | null> {
  const cached = blobUrlCache.get(key)
  if (cached) return cached
  const { blobs } = await list({ prefix: key, limit: 1 })
  if (blobs.length === 0) return null
  blobUrlCache.set(key, blobs[0].url)
  return blobs[0].url
}

async function readBlob(key: string): Promise<string | null> {
  try {
    const url = await getBlobUrl(key)
    if (!url) return null
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function writeBlob(key: string, data: string): Promise<void> {
  // 기존 blob 찾기
  const { blobs } = await list({ prefix: key })
  // 새 blob 저장
  const newBlob = await put(key, data, { access: 'public' })
  blobUrlCache.set(key, newBlob.url)
  // 이전 blob 삭제 (백그라운드)
  if (blobs.length > 0) {
    Promise.all(blobs.map(b => del(b.url).catch(() => {}))).catch(() => {})
  }
}

export async function getProducts(): Promise<Product[]> {
  const raw = await readBlob(PRODUCTS_KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

export async function saveProducts(products: Product[]): Promise<void> {
  await writeBlob(PRODUCTS_KEY, JSON.stringify(products))
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const products = await getProducts()
  return products.find(p => p.id === id)
}

export async function addProduct(product: Product): Promise<Product> {
  const products = await getProducts()
  products.unshift(product)
  await saveProducts(products)
  return product
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const products = await getProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() }
  await saveProducts(products)
  return products[index]
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts()
  const filtered = products.filter(p => p.id !== id)
  if (filtered.length === products.length) return false
  await saveProducts(filtered)
  return true
}

export async function getConfig(): Promise<{ userPassword: string; adminPassword: string }> {
  const raw = await readBlob(CONFIG_KEY)
  if (!raw) return { userPassword: '1234', adminPassword: 'admin1234' }
  return JSON.parse(raw)
}

export async function saveConfig(config: { userPassword: string; adminPassword: string }): Promise<void> {
  await writeBlob(CONFIG_KEY, JSON.stringify(config))
}
