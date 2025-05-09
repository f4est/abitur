import prisma from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    // Проверяем авторизацию пользователя
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }

    const token = authHeader.split(' ')[1]
    const config = useRuntimeConfig()

    // Проверяем токен
    const decoded = jwt.verify(token, config.JWT_SECRET)
    const userId = decoded.id

    // Получаем ID школы из параметров URL
    const schoolId = parseInt(event.context.params.id)
    
    // Удаляем запись о сохраненной школе
    await prisma.savedSchool.deleteMany({
      where: {
        userId: userId,
        schoolId: schoolId
      }
    })
    
    return {
      statusCode: 200,
      body: { message: 'Учебное заведение успешно удалено из избранного' }
    }
    
  } catch (error) {
    console.error('Ошибка при удалении учебного заведения из избранного:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        body: { message: 'Недействительный или истекший токен' }
      }
    }
    
    return {
      statusCode: 500,
      body: { message: `Внутренняя ошибка сервера: ${error.message}` }
    }
  }
}) 