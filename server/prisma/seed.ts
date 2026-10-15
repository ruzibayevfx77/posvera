import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: await hash('admin123', 10),
      name: 'Administrator',
      role: 'admin',
    },
  })

  await prisma.user.upsert({
    where: { username: 'kassir' },
    update: {},
    create: {
      username: 'kassir',
      passwordHash: await hash('kassir123', 10),
      name: 'Kassir',
      role: 'cashier',
    },
  })
}

main().finally(() => prisma.$disconnect())