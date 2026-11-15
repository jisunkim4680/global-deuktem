import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

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
  reservationStart: string
  reservationEnd: string
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

function toProduct(row: any): Product {
  return {
    id: row.id,
    category: row.category,
    brand: row.brand,
    name: row.name,
    size: row.size || '',
    relatedProducts: row.related_products || [],
    price: row.price,
    discountPrice: row.discount_price,
    discountStart: row.discount_start || '',
    discountEnd: row.discount_end || '',
    reservationStart: row.reservation_start || '',
    reservationEnd: row.reservation_end || '',
    description: row.description || '',
    descriptionAlign: row.description_align || 'center',
    colors: row.colors || [],
    options: row.options || [],
    images: row.images || [],
    visible: row.visible,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export async function getProducts(): Promise<Product[]> {
  const rows = await sql`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`
  return rows.map(toProduct)
}

export async function saveProducts(products: Product[]): Promise<void> {
  for (let i = 0; i < products.length; i++) {
    await sql`UPDATE products SET sort_order = ${i} WHERE id = ${products[i].id}`
  }
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`
  return rows.length > 0 ? toProduct(rows[0]) : undefined
}

export async function addProduct(product: Product): Promise<Product> {
  const rows = await sql`
    INSERT INTO products (id, category, brand, name, size, related_products, price, discount_price, discount_start, discount_end, reservation_start, reservation_end, description, description_align, colors, options, images, visible, status, sort_order)
    VALUES (${product.id}, ${product.category}, ${product.brand}, ${product.name}, ${product.size}, ${JSON.stringify(product.relatedProducts)}, ${product.price}, ${product.discountPrice}, ${product.discountStart}, ${product.discountEnd}, ${product.reservationStart}, ${product.reservationEnd}, ${product.description}, ${product.descriptionAlign}, ${JSON.stringify(product.colors)}, ${JSON.stringify(product.options)}, ${JSON.stringify(product.images)}, ${product.visible}, ${product.status}, 0)
    RETURNING *
  `
  return toProduct(rows[0])
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const existing = await getProduct(id)
  if (!existing) return null

  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() }
  const rows = await sql`
    UPDATE products SET
      category = ${merged.category},
      brand = ${merged.brand},
      name = ${merged.name},
      size = ${merged.size},
      related_products = ${JSON.stringify(merged.relatedProducts)},
      price = ${merged.price},
      discount_price = ${merged.discountPrice},
      discount_start = ${merged.discountStart},
      discount_end = ${merged.discountEnd},
      reservation_start = ${merged.reservationStart},
      reservation_end = ${merged.reservationEnd},
      description = ${merged.description},
      description_align = ${merged.descriptionAlign},
      colors = ${JSON.stringify(merged.colors)},
      options = ${JSON.stringify(merged.options)},
      images = ${JSON.stringify(merged.images)},
      visible = ${merged.visible},
      status = ${merged.status},
      updated_at = ${merged.updatedAt}
    WHERE id = ${id}
    RETURNING *
  `
  return rows.length > 0 ? toProduct(rows[0]) : null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM products WHERE id = ${id}`
  return true
}

export async function getConfig(): Promise<{ userPassword: string; adminPassword: string }> {
  const rows = await sql`SELECT key, value FROM config WHERE key IN ('userPassword', 'adminPassword')`
  const config: any = { userPassword: '1234', adminPassword: 'admin1234' }
  for (const row of rows) {
    config[row.key] = row.value
  }
  return config
}

export async function saveConfig(config: { userPassword: string; adminPassword: string }): Promise<void> {
  await sql`INSERT INTO config (key, value) VALUES ('userPassword', ${config.userPassword}) ON CONFLICT (key) DO UPDATE SET value = ${config.userPassword}`
  await sql`INSERT INTO config (key, value) VALUES ('adminPassword', ${config.adminPassword}) ON CONFLICT (key) DO UPDATE SET value = ${config.adminPassword}`
}
