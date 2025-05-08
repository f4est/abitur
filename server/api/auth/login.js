import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Проверка обязательных полей
    if (!email || !password) {
      return {
        statusCode: 400,
        message: 'Email и пароль обязательны'
      }
    }

    // Проверка учетных данных администратора
    if (email === 'Admin123@admin.com' && password === 'PasswordAdmin123') {
      // Имитация успешной аутентификации администратора
      const adminUser = {
        id: 0,
        email: 'Admin123@admin.com',
        name: 'Администратор',
        role: 'ADMIN'
      }
      
      // Создание JWT для админа
      const token = jwt.sign(
        { id: adminUser.id, email: adminUser.email, role: adminUser.role },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      )

      return {
        user: adminUser,
        token
      }
    }

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return {
        statusCode: 404,
        message: 'Пользователь не найден'
      }
    }

    // Проверка пароля
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return {
        statusCode: 401,
        message: 'Неверный пароль'
      }
    }

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
    console.error('Ошибка входа:', error)
    return {
      statusCode: 500,
      message: 'Внутренняя ошибка сервера'
    }
  }
}) 