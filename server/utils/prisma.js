import { PrismaClient } from '@prisma/client'

// Используем один экземпляр Prisma для всего приложения
const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// В режиме разработки сохраняем экземпляр в глобальном объекте
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma 