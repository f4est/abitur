import { verifyToken } from '../../utils/auth'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API users/me: Начало обработки GET-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API users/me: Пользователь не авторизован')
      return {
        statusCode: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Получаем свежие данные о пользователе из базы данных
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        savedSchools: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!currentUser) {
      console.log(`API users/me: Пользователь с ID ${user.id} не найден в базе данных`)
      return {
        statusCode: 404,
        message: 'Пользователь не найден'
      }
    }
    
    console.log(`API users/me: Успешно получены данные пользователя ${currentUser.id}`)
    
    // Возвращаем информацию о пользователе
    return currentUser
  } catch (error) {
    console.error('API users/me: Ошибка:', error)
    return {
      statusCode: 500,
      message: 'Ошибка при получении данных пользователя',
      error: error.message
    }
  }
}) 