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

// Функция для преобразования HTML в текст
const htmlToText = (html) => {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '') // Удаляем все HTML теги
    .replace(/&nbsp;/g, ' ')  // Заменяем неразрывные пробелы
    .replace(/&amp;/g, '&')   // Заменяем амперсанд
    .replace(/&lt;/g, '<')    // Заменяем <
    .replace(/&gt;/g, '>')    // Заменяем >
    .replace(/&quot;/g, '"')  // Заменяем кавычки
    .replace(/&#39;/g, "'")   // Заменяем одинарные кавычки
    .trim()
}

// Функция для получения отзывов из 2GIS
const scrape2GisReviews = async (url) => {
  try {
    // Имитируем парсинг и возвращаем тестовые отзывы
    // В реальном приложении здесь был бы код для парсинга HTML страницы или API 2GIS
    
    const mockReviews = [
      {
        authorName: "Алексей Петров",
        text: "Отличное учебное заведение! Преподаватели очень внимательные и квалифицированные. Рекомендую всем, кто хочет получить качественное образование.",
        rating: 5,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 дня назад
      },
      {
        authorName: "Мария Иванова",
        text: "Хорошее заведение, но есть проблемы с организацией учебного процесса. Иногда меняется расписание без предупреждения. В целом, учиться интересно.",
        rating: 4,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() // 10 дней назад
      },
      {
        authorName: "Никита Сидоров",
        text: "Современное оборудование, отличная библиотека. Для практических занятий есть все необходимое. Единственный минус — столовая могла бы быть лучше.",
        rating: 4,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() // 30 дней назад
      },
      {
        authorName: "Анна Козлова",
        text: "Замечательные преподаватели! Дают не только теоретические знания, но и практические навыки. Очень довольна выбором этого учебного заведения.",
        rating: 5,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString() // 45 дней назад
      },
      {
        authorName: "Дмитрий Новиков",
        text: "Среднее качество образования. Некоторые предметы преподаются отлично, другие - не очень. Инфраструктура неплохая, но требует обновления.",
        rating: 3,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString() // 60 дней назад
      }
    ]
    
    return mockReviews
  } catch (error) {
    console.error('Ошибка при получении отзывов из 2GIS:', error)
    throw new Error('Не удалось получить отзывы из 2GIS. Пожалуйста, проверьте URL и попробуйте снова.')
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Проверяем метод запроса
    if (event.req.method !== 'POST') {
      return {
        statusCode: 405,
        body: { message: 'Метод не поддерживается' }
      }
    }
    
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
    
    // Получаем URL из тела запроса
    const body = await readBody(event)
    const { url } = body
    
    if (!url) {
      return {
        statusCode: 400,
        body: { message: 'Не указан URL' }
      }
    }
    
    if (!url.includes('2gis.ru') && !url.includes('2gis.kz')) {
      return {
        statusCode: 400,
        body: { message: 'Указанный URL не является ссылкой на 2GIS' }
      }
    }
    
    // Получаем отзывы
    const reviews = await scrape2GisReviews(url)
    
    return {
      statusCode: 200,
      body: reviews
    }
  } catch (error) {
    console.error('Ошибка при импорте отзывов из 2GIS:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 