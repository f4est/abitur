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
    
    // Проверяем существование школы
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    })
    
    if (!school) {
      return {
        statusCode: 404,
        body: { message: 'Учебное заведение не найдено' }
      }
    }
    
    // Проверяем, не сохранена ли уже школа
    const existingSave = await prisma.savedSchool.findUnique({
      where: {
        userId_schoolId: {
          userId: userId,
          schoolId: schoolId
        }
      }
    })
    
    if (existingSave) {
      return {
        statusCode: 200,
        body: { message: 'Учебное заведение уже сохранено' }
      }
    }
    
    // Сохраняем школу
    await prisma.savedSchool.create({
      data: {
        userId: userId,
        schoolId: schoolId
      }
    })
    
    return {
      statusCode: 201,
      body: { message: 'Учебное заведение успешно сохранено' }
    }
    
  } catch (error) {
    console.error('Ошибка при сохранении учебного заведения:', error)
    
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