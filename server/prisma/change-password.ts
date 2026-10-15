import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const [username, newPassword] = process.argv.slice(2)

  if (!username || !newPassword) {
    console.log('Ishlatilishi: npx tsx prisma/change-password.ts LOGIN YANGI_PAROL')
    return
  }
  if (newPassword.length < 8) {
    console.log("Parol kamida 8 belgidan iborat bo'lsin")
    return
  }

  const result = await prisma.user.updateMany({
    where: { username },
    data: { passwordHash: await hash(newPassword, 10) },
  })

  console.log(
    result.count === 1
      ? `${username} paroli o'zgartirildi`
      : 'Bunday foydalanuvchi topilmadi'
  )
}

main().finally(() => prisma.$disconnect())