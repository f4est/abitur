import { verifyToken } from '../../utils/auth'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API external-reviews/delete: Начало обработки DELETE-запроса')
  
  try {
    // Проверяем метод запроса
    if (event.req.method !== 'DELETE') {
      console.log('API external-reviews/delete: Некорректный метод запроса')
      setResponseStatus(event, 405)
      return {
        status: 405,
        message: 'Метод не поддерживается'
      }
    }
    
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API external-reviews/delete: Ошибка авторизации')
      setResponseStatus(event, 401)
      return {
        status: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API external-reviews/delete: Недостаточно прав')
      setResponseStatus(event, 403)
      return {
        status: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем параметры запроса
    const query = getQuery(event)
    const reviewId = query.id
    
    // Проверяем наличие обязательного параметра id
    if (!reviewId) {
      console.log('API external-reviews/delete: Отсутствует параметр id')
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Отсутствует обязательный параметр id'
      }
    }
    
    // Пытаемся преобразовать id в число
    const reviewIdNum = parseInt(reviewId)
    if (isNaN(reviewIdNum)) {
      console.log(`API external-reviews/delete: Некорректный параметр id: ${reviewId}`)
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Параметр id должен быть числом'
      }
    }
    
    // Проверяем существование отзыва
    const review = await prisma.review2GIS.findUnique({
      where: { id: reviewIdNum }
    })
    
    if (!review) {
      console.log(`API external-reviews/delete: Отзыв с ID ${reviewIdNum} не найден`)
      setResponseStatus(event, 404)
      return {
        status: 404,
        message: `Отзыв с ID ${reviewIdNum} не найден`
      }
    }
    
    // Удаляем отзыв
    await prisma.review2GIS.delete({
      where: { id: reviewIdNum }
    })
    
    console.log(`API external-reviews/delete: Отзыв с ID ${reviewIdNum} успешно удален`)
    
    // Возвращаем успешный результат
    return {
      status: 200,
      message: 'Отзыв успешно удален'
    }
  } catch (error) {
    console.error('API external-reviews/delete: Ошибка:', error)
    setResponseStatus(event, 500)
    return {
      status: 500,
      message: 'Ошибка при удалении отзыва',
      error: error.message
    }
  }
}) 