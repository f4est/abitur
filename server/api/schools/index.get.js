import prisma from '../../utils/prisma'
import path from 'path'
import fs from 'fs'
import { verifyToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Получаем параметры запроса
    const query = getQuery(event)
    const search = query.search || ''
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 100
    const offset = (page - 1) * limit
    
    // Проверка авторизации для админ-панели
    const isAdminRequest = query.admin === 'true' || event.path.includes('/admin')
    if (isAdminRequest) {
      const user = verifyToken(event)
      if (!user) {
        console.log('API schools: Ошибка авторизации для админ-запроса')
        setResponseStatus(event, 401)
        return {
          status: 401,
          message: 'Требуется авторизация'
        }
      }
      
      if (user.role !== 'ADMIN') {
        console.log('API schools: Недостаточно прав для админ-запроса')
        setResponseStatus(event, 403)
        return {
          status: 403,
          message: 'Доступ запрещен. Требуются права администратора.'
        }
      }
      
      console.log('API schools: Авторизованный запрос от администратора')
    }

    // Выполняем запрос с поиском (если указан)
    const where = search 
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ]
        }
      : {}

    // Получаем школы с подсчетом связанных данных
    const schools = await prisma.school.findMany({
      where,
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        address: true,
        logoUrl: true,
        description: true,
        _count: {
          select: {
            programs: true,
            photos: true,
            savedByUsers: true
          }
        },
        reviews: {
          where: {
            isApproved: true
          },
          select: {
            rating: true
          }
        }
      },
      skip: offset,
      take: limit
    })
    
    // Проверка и нормализация URL логотипов, добавление средней оценки
    const normalizedSchools = schools.map(school => {
      // Обрабатываем logoUrl, чтобы убедиться в его доступности
      let normalizedLogoUrl = school.logoUrl;
      
      // Если URL не начинается с / или http, считаем его относительным и добавляем /
      if (normalizedLogoUrl && !normalizedLogoUrl.startsWith('/') && !normalizedLogoUrl.startsWith('http')) {
        normalizedLogoUrl = `/${normalizedLogoUrl}`;
      }
      
      // Если URL начинается с /, убедимся что файл существует на сервере
      if (normalizedLogoUrl && normalizedLogoUrl.startsWith('/')) {
        try {
          const filePath = path.join(process.cwd(), 'public', normalizedLogoUrl);
          // Если файл не существует, сбрасываем URL
          if (!fs.existsSync(filePath)) {
            console.warn(`Логотип не найден на сервере: ${filePath}`);
            normalizedLogoUrl = null;
          }
        } catch (error) {
          console.error(`Ошибка при проверке логотипа: ${error.message}`);
          // При ошибке проверки не меняем URL
        }
      }

      // Рассчитываем среднюю оценку на основе отзывов
      let averageRating = null;
      let reviewCount = 0;
      
      if (school.reviews && school.reviews.length > 0) {
        reviewCount = school.reviews.length;
        const totalRating = school.reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : null;
      }

      return {
        ...school,
        logoUrl: normalizedLogoUrl,
        averageRating,
        reviewCount,
        // Удаляем полные отзывы из ответа, так как нам нужны только средние значения
        reviews: undefined 
      };
    });

    // Подсчет общего количества школ для пагинации
    const total = await prisma.school.count({
      where
    })

    return {
      body: normalizedSchools,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Ошибка при получении школ:', error)
    return createError({
      statusCode: 500,
      message: 'Ошибка при получении списка учебных заведений'
    })
  }
}) 