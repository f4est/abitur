import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем параметры запроса
    const query = getQuery(event)
    const schoolId = parseInt(query.schoolId)
    
    // Проверяем, что ID школы передан и является числом
    if (!schoolId || isNaN(schoolId)) {
      return {
        statusCode: 400,
        body: { message: 'Некорректный ID учебного заведения' }
      }
    }
    
    // Получаем отзывы для указанной школы
    const reviews = await prisma.review.findMany({
      where: {
        schoolId: schoolId,
        // Для обычных пользователей показываем только одобренные отзывы
        // Администраторы могут видеть все отзывы через админ-панель
        isApproved: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    })
    
    return {
      body: reviews
    }
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 