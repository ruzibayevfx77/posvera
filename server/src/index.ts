import 'dotenv/config'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import jwt from 'jsonwebtoken'
import { compare } from 'bcryptjs'
import { PrismaClient, Prisma } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('.env faylida JWT_SECRET topilmadi')
}

app.use(cors())
app.use(express.json())

// ---------- Autentifikatsiya ----------

type AuthPayload = {
  id: number
  username: string
  name: string
  role: 'admin' | 'cashier'
}

const authRequired = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Tizimga kiring' })
    return
  }

  try {
    res.locals.user = jwt.verify(token, JWT_SECRET) as AuthPayload
    next()
  } catch {
    res.status(401).json({ error: 'Sessiya tugagan, qaytadan kiring' })
  }
}

const adminOnly = (_req: Request, res: Response, next: NextFunction) => {
  if (res.locals.user?.role !== 'admin') {
    res.status(403).json({ error: "Bu amal uchun ruxsat yo'q" })
    return
  }
  next()
}

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body

  const user = await prisma.user.findUnique({
    where: { username: String(username || '') },
  })
  const passwordOk =
    user !== null && (await compare(String(password || ''), user.passwordHash))

  if (!user || !passwordOk) {
    res.status(401).json({ error: "Login yoki parol noto'g'ri" })
    return
  }

  const payload: AuthPayload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as 'admin' | 'cashier',
  }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' })

  res.json({
    token,
    user: { username: user.username, name: user.name, role: user.role },
  })
})

app.use('/api', authRequired)

// ---------- Mahsulotlar ----------

app.get('/api/products', async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  res.json(products)
})

app.post('/api/products', adminOnly, async (req, res) => {
  const { name, price, category, stock } = req.body
  if (!name || price == null) {
    res.status(400).json({ error: 'Nomi va narxi kerak' })
    return
  }
  const product = await prisma.product.create({
    data: {
      name,
      price: Number(price),
      category: category || 'Boshqa',
      stock: Number(stock) || 0,
    },
  })
  res.status(201).json(product)
})

app.put('/api/products/:id', adminOnly, async (req, res) => {
  const { name, price, category, stock } = req.body
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: {
      name,
      price: Number(price),
      category: category || 'Boshqa',
      stock: Number(stock) || 0,
    },
  })
  res.json(product)
})

app.delete('/api/products/:id', adminOnly, async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

// ---------- Sotuvlar ----------

type SaleFull = Prisma.SaleGetPayload<{
  include: { items: true; payments: true }
}>

const toSaleDto = (s: SaleFull) => ({
  id: s.id,
  date: s.createdAt.toISOString(),
  items: s.items.map((i) => ({
    name: i.name,
    price: i.price,
    quantity: i.quantity,
  })),
  discountAmount: s.discountAmount,
  total: s.total,
  method: s.method,
  // Eski sotuvlarda to'lovlar jadvali bo'sh, shuning uchun method bo'yicha tuzamiz
  payments:
    s.payments.length > 0
      ? s.payments.map((p) => ({ type: p.type, amount: p.amount }))
      : [{ type: s.method, amount: s.total }],
  cashier: s.cashier ?? undefined,
})

app.get('/api/sales', adminOnly, async (_req, res) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, payments: true },
  })
  res.json(sales.map(toSaleDto))
})

app.post('/api/sales', async (req, res) => {
  const { items, discountAmount } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Savat bo'sh" })
    return
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const lines: {
        productId: number
        name: string
        price: number
        quantity: number
      }[] = []
      let subtotal = 0

      for (const item of items) {
        const quantity = Number(item.quantity)
        const product = await tx.product.findUnique({
          where: { id: Number(item.productId) },
        })

        if (!product || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Mahsulot yoki miqdor noto'g'ri")
        }
        if (product.stock < quantity) {
          throw new Error(
            `"${product.name}" yetarli emas (qoldiq: ${product.stock})`
          )
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        })

        lines.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })
        subtotal += product.price * quantity
      }

      const discount = Math.min(
        Math.max(Math.round(Number(discountAmount) || 0), 0),
        subtotal
      )
      const total = subtotal - discount

      // To'lov: yangi frontend cardAmount va cashReceived yuboradi,
      // eski frontend esa faqat method yuboradi (shuning uchun ikkalasi ham ishlaydi)
      let card: number
      let received: number
      if (req.body.cardAmount === undefined) {
        if (req.body.method !== 'cash' && req.body.method !== 'card') {
          throw new Error("To'lov turi noto'g'ri")
        }
        card = req.body.method === 'card' ? total : 0
        received = total - card
      } else {
        card = Math.round(Number(req.body.cardAmount) || 0)
        received = Math.round(Number(req.body.cashReceived) || 0)
      }

      if (card < 0 || card > total) {
        throw new Error("Karta summasi noto'g'ri")
      }
      const cashDue = total - card
      if (received < cashDue) {
        throw new Error('Berilgan naqd pul yetarli emas')
      }

      const payments: { type: string; amount: number }[] = []
      if (cashDue > 0) payments.push({ type: 'cash', amount: cashDue })
      if (card > 0) payments.push({ type: 'card', amount: card })

      const method = card === 0 ? 'cash' : cashDue === 0 ? 'card' : 'mixed'

      const sale = await tx.sale.create({
        data: {
          discountAmount: discount,
          total,
          method,
          // Kassir nomi tokendan olinadi, frontenddan emas
          cashier: res.locals.user.name,
          items: { create: lines },
          payments: { create: payments },
        },
        include: { items: true, payments: true },
      })

      return { sale, change: cashDue > 0 ? received - cashDue : 0 }
    })

    res.status(201).json({ ...toSaleDto(result.sale), change: result.change })
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Xato' })
  }
})

// ---------- Sozlamalar ----------

const SETTING_KEYS = [
  'shopName',
  'shopAddress',
  'shopPhone',
  'receiptFooter',
] as const
type SettingKey = (typeof SETTING_KEYS)[number]
type ShopSettings = Record<SettingKey, string>

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'POSVERA',
  shopAddress: '',
  shopPhone: '',
  receiptFooter: '',
}

const loadSettings = async (): Promise<ShopSettings> => {
  const rows = await prisma.setting.findMany()
  const settings = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
      settings[row.key as SettingKey] = row.value
    }
  }
  return settings
}

// Hamma rollar o'qiy oladi (chekda do'kon nomi kerak)
app.get('/api/settings', async (_req, res) => {
  res.json(await loadSettings())
})

// Faqat admin o'zgartira oladi
app.put('/api/settings', adminOnly, async (req, res) => {
  const body = req.body ?? {}
  const updates: { key: SettingKey; value: string }[] = []

  for (const key of SETTING_KEYS) {
    if (body[key] === undefined) continue
    const value = String(body[key]).trim()

    if (value.length > 200) {
      res.status(400).json({ error: 'Matn juda uzun' })
      return
    }
    if (key === 'shopName' && value === '') {
      res.status(400).json({ error: "Do'kon nomi bo'sh bo'lmasin" })
      return
    }
    updates.push({ key, value })
  }

  await prisma.$transaction(
    updates.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  )

  res.json(await loadSettings())
})

// ---------- Tayyor frontendni ko'rsatish ----------

const distPath = path.join(__dirname, '../../dist')
app.use(express.static(distPath))
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`POSVERA server ishga tushdi: http://localhost:${PORT}`)
})