import { verifyToken } from '../../utils/auth'
import prisma from '../../utils/prisma'

// Функция для проверки URL на соответствие формату 2GIS
const is2GisReviewUrl = (url) => {
  try {
    // Проверяем, что URL из 2GIS
    const urlObj = new URL(url)
    return (urlObj.hostname === '2gis.kz' || 
            urlObj.hostname === '2gis.ru' || 
            urlObj.hostname.endsWith('2gis.com')) && 
           urlObj.pathname.includes('/firm/') && 
           url.includes('/tab/reviews')
  } catch (e) {
    return false
  }
}

// Функция для парсинга идентификатора организации из URL 2GIS
const extractFirmId = (url) => {
  try {
    const firmIdMatch = url.match(/\/firm\/(\d+)/);
    if (firmIdMatch && firmIdMatch[1]) {
      return firmIdMatch[1];
    }
    
    // Альтернативный формат URL
    const alternativeMatch = url.match(/\/firm\/([^\/]+)/);
    if (alternativeMatch && alternativeMatch[1]) {
      return alternativeMatch[1];
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

export default defineEventHandler(async (event) => {
  console.log('API external-reviews/import: Начало обработки POST-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API external-reviews/import: Ошибка авторизации')
      return {
        statusCode: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API external-reviews/import: Недостаточно прав')
      return {
        statusCode: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    console.log('API external-reviews/import: Получены данные:', body)
    
    const { url, schoolId } = body
    
    if (!url) {
      return {
        statusCode: 400,
        message: 'URL не указан'
      }
    }
    
    if (!schoolId) {
      return {
        statusCode: 400,
        message: 'ID школы не указан'
      }
    }
    
    // Проверяем, что URL является ссылкой на 2GIS
    if (!is2GisReviewUrl(url)) {
      console.log(`API external-reviews/import: Некорректный URL 2GIS: ${url}`)
      return {
        statusCode: 400,
        message: 'Указанный URL не является ссылкой на отзывы в 2GIS',
        validationDetails: 'URL должен быть ссылкой на вкладку отзывов в 2GIS, например: https://2gis.kz/almaty/firm/12345/tab/reviews'
      }
    }
    
    // Извлекаем ID организации из URL
    const firmId = extractFirmId(url)
    if (!firmId) {
      console.log(`API external-reviews/import: Не удалось извлечь ID организации из URL: ${url}`)
      return {
        statusCode: 400,
        message: 'Не удалось извлечь ID организации из URL'
      }
    }
    
    console.log(`API external-reviews/import: Импорт отзывов для школы ${schoolId}, firmId: ${firmId}`)
    
    // Здесь должна быть логика скрапинга/импорта отзывов из 2GIS
    // В данной реализации мы просто сохраняем URL для дальнейшей обработки
    
    // Проверяем существование школы
    const school = await prisma.school.findUnique({
      where: { id: parseInt(schoolId) }
    })
    
    if (!school) {
      console.log(`API external-reviews/import: Школа с ID ${schoolId} не найдена`)
      return {
        statusCode: 404,
        message: `Школа с ID ${schoolId} не найдена`
      }
    }
    
    // Обновляем школу, добавляя ссылку на отзывы 2GIS
    const updatedSchool = await prisma.school.update({
      where: { id: parseInt(schoolId) },
      data: {
        externalReviewsUrl: url,
        externalReviewsSource: '2GIS',
        externalReviewsId: firmId
      }
    })
    
    console.log(`API external-reviews/import: URL отзывов успешно сохранен для школы ${schoolId}`)
    
    // В реальном приложении здесь можно было бы запустить фоновую задачу для импорта отзывов
    
    return {
      message: 'Ссылка на отзывы успешно сохранена',
      data: {
        schoolId: updatedSchool.id,
        externalReviewsUrl: updatedSchool.externalReviewsUrl,
        externalReviewsSource: updatedSchool.externalReviewsSource,
        externalReviewsId: updatedSchool.externalReviewsId
      }
    }
  } catch (error) {
    console.error('API external-reviews/import: Ошибка:', error)
    return {
      statusCode: 500,
      message: 'Ошибка при импорте отзывов',
      error: error.message
    }
  }
}) 