import { put, list, del, head } from '@vercel/blob'

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

// URL 캐시 - list 호출 없이 바로 fetch
const urlCache = new Map<string, string>()

async function readBlob(key: string): Promise<string | null> {
  try {
    // 캐시된 URL이 있으면 바로 fetch
    const cached = urlCache.get(key)
    if (cached) {
      const res = await fetch(cached, { cache: 'no-store' })
      if (res.ok) return await res.text()
    }
    // 없으면 list로 찾기
    const { blobs } = await list({ prefix: key })
    if (blobs.length === 0) return null
    urlCache.set(key, blobs[0].url)
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    return await res.text()
  } catch {
    return null
  }
}

async function writeBlob(key: string, data: string): Promise<void> {
  const blob = await put(key, data, { access: 'public', addRandomSuffix: false })
  urlCache.set(key, blob.url)
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
