import { verifyToken } from '../../utils/auth'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API external-reviews/update: Начало обработки PUT-запроса')
  
  try {
    // Проверяем метод запроса
    if (event.req.method !== 'PUT') {
      console.log('API external-reviews/update: Некорректный метод запроса')
      setResponseStatus(event, 405)
      return {
        status: 405,
        message: 'Метод не поддерживается'
      }
    }
    
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API external-reviews/update: Ошибка авторизации')
      setResponseStatus(event, 401)
      return {
        status: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API external-reviews/update: Недостаточно прав')
      setResponseStatus(event, 403)
      return {
        status: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    console.log('API external-reviews/update: Получены данные:', body)
    
    // Проверяем обязательные поля
    if (!body.id) {
      console.log('API external-reviews/update: Отсутствует обязательное поле id')
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Отсутствует обязательное поле id'
      }
    }
    
    // Преобразуем id в число
    const reviewId = parseInt(body.id)
    if (isNaN(reviewId)) {
      console.log(`API external-reviews/update: Некорректный параметр id: ${body.id}`)
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Параметр id должен быть числом'
      }
    }
    
    // Проверяем существование отзыва
    const review = await prisma.review2GIS.findUnique({
      where: { id: reviewId }
    })
    
    if (!review) {
      console.log(`API external-reviews/update: Отзыв с ID ${reviewId} не найден`)
      setResponseStatus(event, 404)
      return {
        status: 404,
        message: `Отзыв с ID ${reviewId} не найден`
      }
    }
    
    // Подготавливаем данные для обновления
    const updateData = {}
    
    // Если передан параметр isSelected, обновляем его
    if (body.isSelected !== undefined) {
      updateData.isSelected = !!body.isSelected // Преобразуем в boolean
    }
    
    // Если нет данных для обновления, возвращаем ошибку
    if (Object.keys(updateData).length === 0) {
      console.log('API external-reviews/update: Нет данных для обновления')
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Нет данных для обновления. Укажите хотя бы один параметр.'
      }
    }
    
    // Обновляем отзыв
    const updatedReview = await prisma.review2GIS.update({
      where: { id: reviewId },
      data: updateData
    })
    
    console.log(`API external-reviews/update: Отзыв с ID ${reviewId} успешно обновлен:`, updatedReview)
    
    // Возвращаем обновленный отзыв
    return {
      status: 200,
      message: 'Отзыв успешно обновлен',
      data: updatedReview
    }
  } catch (error) {
    console.error('API external-reviews/update: Ошибка:', error)
    setResponseStatus(event, 500)
    return {
      status: 500,
      message: 'Ошибка при обновлении отзыва',
      error: error.message
    }
  }
}) 