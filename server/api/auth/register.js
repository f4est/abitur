import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const body = await readBody(event)
    const { email, password, name } = body

    // Проверка обязательных полей
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        message: 'Все поля обязательны для заполнения'
      }
    }

    // Проверка, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        statusCode: 400,
        message: 'Пользователь с таким email уже существует'
      }
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    // Создание JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Возвращаем данные пользователя без пароля
    const { password: _, ...userWithoutPassword } = user
    return {
      user: userWithoutPassword,
      token
    }
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    return {
      statusCode: 500,
      message: 'Внутренняя ошибка сервера'
    }
  }
}) 