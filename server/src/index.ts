import express from 'express'
import cors from 'cors'
import { PrismaClient, Prisma } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// ---------- Mahsulotlar ----------

app.get('/api/products', async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  res.json(products)
})

app.post('/api/products', async (req, res) => {
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

app.put('/api/products/:id', async (req, res) => {
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

app.delete('/api/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

// ---------- Sotuvlar ----------

type SaleWithItems = Prisma.SaleGetPayload<{ include: { items: true } }>

// Bazadagi sotuvni frontend kutadigan ko'rinishga o'tkazadi
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

app.get('/api/sales', async (_req, res) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })
  res.json(sales.map(toSaleDto))
})

app.post('/api/sales', async (req, res) => {
  const { items, discountAmount, method, cashier } = req.body

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
          cashier: cashier || null,
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