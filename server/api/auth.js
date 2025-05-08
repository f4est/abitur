import prisma from '../utils/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const url = event.req.url
  const config = useRuntimeConfig()

  // Регистрация пользователя
  if (method === 'POST' && url.endsWith('/api/auth/register')) {
    const body = await readBody(event)
    const { email, password, name, redirectUrl } = body

    // Проверка обязательных полей
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        message: 'Все поля обязательны для заполнения'
      }
    }

    try {
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

      // Возвращаем данные пользователя без пароля и с токеном для автоматической авторизации
      const { password: _, ...userWithoutPassword } = user
      return {
        user: userWithoutPassword,
        token,
        redirectUrl: redirectUrl || '/' // Возвращаем URL для перенаправления, если он был передан
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      return {
        statusCode: 500,
        message: 'Внутренняя ошибка сервера'
      }
    }
  }

  // Вход пользователя
  if (method === 'POST' && url.endsWith('/api/auth/login')) {
    const body = await readBody(event)
    const { email, password } = body

    // Проверка обязательных полей
    if (!email || !password) {
      return {
        statusCode: 400,
        message: 'Email и пароль обязательны'
      }
    }

    try {
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
  }

  // Если запрос не соответствует ни одному из обработчиков
  return {
    statusCode: 404,
    message: 'Маршрут не найден'
  }
}) 