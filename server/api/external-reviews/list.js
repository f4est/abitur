import prisma from '../../utils/prisma'
import { verifyToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  console.log('API external-reviews/list: Начало обработки GET-запроса')
  
  try {
    // Получаем параметры запроса
    const query = getQuery(event)
    const schoolId = query.schoolId
    const isAdmin = query.admin === 'true'
    
    // Проверяем наличие обязательного параметра schoolId
    if (!schoolId) {
      console.log('API external-reviews/list: Отсутствует параметр schoolId')
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Отсутствует обязательный параметр schoolId'
      }
    }
    
    // Пытаемся преобразовать schoolId в число
    const schoolIdNum = parseInt(schoolId)
    if (isNaN(schoolIdNum)) {
      console.log(`API external-reviews/list: Некорректный параметр schoolId: ${schoolId}`)
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Параметр schoolId должен быть числом'
      }
    }
    
    // Проверяем существование школы
    const school = await prisma.school.findUnique({
      where: { id: schoolIdNum }
    })
    
    if (!school) {
      console.log(`API external-reviews/list: Школа с ID ${schoolIdNum} не найдена`)
      setResponseStatus(event, 404)
      return {
        status: 404,
        message: `Школа с ID ${schoolIdNum} не найдена`
      }
    }
    
    // Если это запрос от админа, проверяем права
    if (isAdmin) {
      const user = verifyToken(event)
      if (!user || user.role !== 'ADMIN') {
        console.log('API external-reviews/list: Недостаточно прав для получения всех отзывов')
        setResponseStatus(event, 403)
        return {
          status: 403,
          message: 'Доступ запрещен. Требуются права администратора.'
        }
      }
    }
    
    // Задаем условия поиска отзывов
    const whereCondition = { 
      schoolId: schoolIdNum
    }
    
    // Для неадминистративных запросов добавляем фильтр по isSelected
    if (!isAdmin) {
      whereCondition.isSelected = true
    }
    
    // Получаем отзывы для указанной школы
    const reviews = await prisma.review2GIS.findMany({
      where: whereCondition,
      orderBy: {
        date: 'desc' // Сортировка от новых к старым
      }
    })
    
    console.log(`API external-reviews/list: Найдено ${reviews.length} отзывов для школы с ID ${schoolIdNum}`)
    
    // Возвращаем список отзывов
    return {
      status: 200,
      body: reviews
    }
  } catch (error) {
    console.error('API external-reviews/list: Ошибка:', error)
    setResponseStatus(event, 500)
    return {
      status: 500,
      message: 'Ошибка при получении отзывов',
      error: error.message
    }
  }
}) 