import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    // Получаем токен из заголовка авторизации
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: { message: 'Токен авторизации отсутствует или неверного формата' }
      }
    }

    const token = authHeader.split(' ')[1]
    const config = useRuntimeConfig()

    // Проверяем токен
    const decoded = jwt.verify(token, config.JWT_SECRET)
    
    // Получаем данные пользователя из базы данных
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'Пользователь не найден' }
      }
    }

    return {
      body: user
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        body: { message: 'Недействительный или истекший токен' }
      }
    }
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 