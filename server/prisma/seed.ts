import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.product.createMany({
    data: [
      { name: 'Non', price: 4000, category: 'Oziq-ovqat', stock: 50 },
      { name: 'Sut 1L', price: 12000, category: 'Oziq-ovqat', stock: 30 },
      { name: 'Tuxum (10 dona)', price: 15000, category: 'Oziq-ovqat', stock: 25 },
      { name: 'Cola 1.5L', price: 11000, category: 'Ichimlik', stock: 40 },
      { name: 'Suv 1L', price: 3000, category: 'Ichimlik', stock: 60 },
      { name: 'Choy', price: 18000, category: 'Ichimlik', stock: 20 },
      { name: 'Shokolad', price: 9000, category: 'Shirinlik', stock: 35 },
      { name: 'Pechenye', price: 7000, category: 'Shirinlik', stock: 45 },
    ],
  })
}

main().finally(() => prisma.$disconnect())