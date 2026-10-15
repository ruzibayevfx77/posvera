import 'dotenv/config'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
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

// Token borligini va to'g'riligini tekshiradi
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

// Faqat admin uchun
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

// Bundan keyingi hamma /api so'rovlari uchun token shart
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

type SaleWithItems = Prisma.SaleGetPayload<{ include: { items: true } }>

const toSaleDto = (s: SaleWithItems) => ({
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
  cashier: s.cashier ?? undefined,
})

app.get('/api/sales', adminOnly, async (_req, res) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })
  res.json(sales.map(toSaleDto))
})

app.post('/api/sales', async (req, res) => {
  const { items, discountAmount, method } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Savat bo'sh" })
    return
  }
  if (method !== 'cash' && method !== 'card') {
    res.status(400).json({ error: "To'lov turi noto'g'ri" })
    return
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
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

      return tx.sale.create({
        data: {
          discountAmount: discount,
          total: subtotal - discount,
          method,
          // Kassir nomi tokendan olinadi, frontenddan emas
          cashier: res.locals.user.name,
          items: { create: lines },
        },
        include: { items: true },
      })
    })

    res.status(201).json(toSaleDto(sale))
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Xato' })
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`POSVERA server ishga tushdi: http://localhost:${PORT}`)
})