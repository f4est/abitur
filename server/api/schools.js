import { prisma } from '~/server/db/prisma'
import { verifyToken, isAdmin } from '~/server/utils/auth'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    // Проверяем авторизацию
    const user = await verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    // Получаем список школ
    const schools = await prisma.school.findMany({
      include: {
        programs: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            duration: true,
            price: true,
            schoolId: true,
            createdAt: true,
            updatedAt: true,
            examRequirements: true
          }
        },
        _count: {
          select: {
            photos: true,
            programs: true,
            savedByUsers: true,
            reviews: true
          }
        }
      }
    })
    
    // Преобразуем данные для клиента, добавляя поля email и phone из поля contacts
    const formattedSchools = schools.map(school => {
      // Извлекаем email и телефон из поля contacts, если они есть
      let email = '';
      let phone = '';
      
      if (school.contacts) {
        const emailMatch = school.contacts.match(/Email: ([^,]+)/i);
        if (emailMatch && emailMatch[1]) {
          email = emailMatch[1].trim();
        }
        
        const phoneMatch = school.contacts.match(/Телефон: ([^,]+)/i);
        if (phoneMatch && phoneMatch[1]) {
          phone = phoneMatch[1].trim();
        }
      }
      
      // Возвращаем обогащенный объект
      return {
        ...school,
        email,
        phone,
        websiteUrl: school.websiteUrl || '',
        description: school.description || ''
      };
    });
    
    return {
      statusCode: 200,
      body: formattedSchools || [],
      total: formattedSchools.length
    }
  } catch (error) {
    console.error('Ошибка при получении списка школ:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 