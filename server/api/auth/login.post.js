import { prisma } from '~/server/db/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      return createError({
        statusCode: 400,
        message: 'Email и пароль обязательны'
      })
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return createError({
        statusCode: 401,
        message: 'Неверный email или пароль'
      })
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return createError({
        statusCode: 401,
        message: 'Неверный email или пароль'
      })
    }

    // Создаем токен
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Устанавливаем куки
    setCookie(event, 'token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    })

    // Возвращаем данные пользователя (без пароля)
    const { password: _, ...userWithoutPassword } = user

    // Возвращаем данные напрямую, без обертывания в statusCode/body
    return {
      user: userWithoutPassword,
      token
    }
  } catch (error) {
    console.error('Ошибка при авторизации:', error)
    return createError({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера'
    })
  }
}) 