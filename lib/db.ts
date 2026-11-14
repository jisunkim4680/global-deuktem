import fs from 'fs'
import path from 'path'

const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'products.json')
const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json')

export interface Product {
  id: string
  category: string
  brand: string
  name: string
  price: number
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

export function getProducts(): Product[] {
  const raw = fs.readFileSync(PRODUCTS_PATH, 'utf-8')
  return JSON.parse(raw)
}

export function saveProducts(products: Product[]): void {
  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2))
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find(p => p.id === id)
}

export function addProduct(product: Product): Product {
  const products = getProducts()
  products.unshift(product)
  saveProducts(products)
  return product
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() }
  saveProducts(products)
  return products[index]
}

export function deleteProduct(id: string): boolean {
  const products = getProducts()
  const filtered = products.filter(p => p.id !== id)
  if (filtered.length === products.length) return false
  saveProducts(filtered)
  return true
}

export function getConfig(): { userPassword: string; adminPassword: string } {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
  return JSON.parse(raw)
}

export function saveConfig(config: { userPassword: string; adminPassword: string }): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}
