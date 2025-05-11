import { verifyToken } from '../../utils/auth'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API external-reviews/add: Начало обработки POST-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API external-reviews/add: Ошибка авторизации')
      setResponseStatus(event, 401)
      return {
        status: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API external-reviews/add: Недостаточно прав')
      setResponseStatus(event, 403)
      return {
        status: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    console.log('API external-reviews/add: Получены данные:', JSON.stringify(body, null, 2))
    
    // Проверяем обязательные поля
    if (!body.schoolId || !body.authorName || !body.text || body.rating === undefined) {
      console.log('API external-reviews/add: Отсутствуют обязательные поля')
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Отсутствуют обязательные поля: schoolId, authorName, text, rating'
      }
    }
    
    // Проверяем корректность рейтинга
    const rating = parseInt(body.rating)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      console.log(`API external-reviews/add: Некорректный рейтинг: ${body.rating}`)
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Рейтинг должен быть числом от 1 до 5'
      }
    }
    
    // Проверяем существование школы
    const school = await prisma.school.findUnique({
      where: { id: parseInt(body.schoolId) }
    })
    
    if (!school) {
      console.log(`API external-reviews/add: Школа с ID ${body.schoolId} не найдена`)
      setResponseStatus(event, 404)
      return {
        status: 404,
        message: `Школа с ID ${body.schoolId} не найдена`
      }
    }
    
    // Подготавливаем данные для создания отзыва
    const reviewData = {
      text: body.text,
      rating: rating,
      authorName: body.authorName,
      schoolId: parseInt(body.schoolId),
      isSelected: body.isSelected !== false // По умолчанию true
    }
    
    // Отдельно обрабатываем дату, так как с ней могут быть проблемы
    if (body.date) {
      try {
        // Если дата передана в ISO формате, парсим её
        reviewData.date = new Date(body.date)
        console.log(`API external-reviews/add: Дата из запроса: ${body.date}, Преобразованная дата: ${reviewData.date}`)
      } catch (e) {
        console.error('API external-reviews/add: Ошибка преобразования даты:', e)
        // Если не удалось распарсить дату, используем текущую
        reviewData.date = new Date()
      }
    } else {
      // Если дата не указана, используем текущую
      reviewData.date = new Date()
    }
    
    console.log('API external-reviews/add: Данные для создания отзыва:', JSON.stringify(reviewData, null, 2))
    
    // Вывод схемы модели для отладки
    console.log('API external-reviews/add: Поля модели Review2GIS:', 
      Object.keys(prisma.review2GIS.fields).join(', '))
    
    // Создаем отзыв в базе данных
    const review = await prisma.review2GIS.create({
      data: reviewData
    })
    
    console.log('API external-reviews/add: Отзыв успешно добавлен:', review)
    
    // Возвращаем созданный отзыв
    setResponseStatus(event, 201)
    return {
      status: 201,
      message: 'Отзыв успешно добавлен',
      data: review
    }
  } catch (error) {
    console.error('API external-reviews/add: Ошибка создания отзыва:', error)
    setResponseStatus(event, 500)
    return {
      status: 500,
      message: 'Ошибка при добавлении отзыва',
      error: error.message
    }
  }
}) 