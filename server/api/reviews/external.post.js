import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'

// Проверка авторизации
const verifyToken = (event) => {
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Проверка прав администратора
const isAdmin = (user) => {
  return user && user.role === 'ADMIN'
}

export default defineEventHandler(async (event) => {
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    // Проверяем права администратора
    if (!isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    
    // Проверяем обязательные поля
    const { schoolId, authorName, rating, text, source } = body
    
    if (!schoolId || !authorName || !rating || !text) {
      return {
        statusCode: 400,
        body: { message: 'Отсутствуют обязательные поля (schoolId, authorName, rating, text)' }
      }
    }
    
    // Проверяем существование школы
    const school = await prisma.school.findUnique({
      where: { id: parseInt(schoolId) }
    })
    
    if (!school) {
      return {
        statusCode: 404,
        body: { message: 'Школа не найдена' }
      }
    }
    
    // Создаем внешний отзыв
    const review = await prisma.review.create({
      data: {
        schoolId: parseInt(schoolId),
        authorName,
        rating: parseFloat(rating),
        text,
        source: source || '2GIS',
        isExternal: true
      }
    })
    
    return {
      statusCode: 201,
      body: review
    }
    
  } catch (error) {
    console.error('Ошибка при добавлении внешнего отзыва:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 