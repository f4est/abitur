import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем ID отзыва из параметров URL
    const id = parseInt(event.context.params.id)
    
    // Получаем отзыв из базы данных
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            name: true,
            logoUrl: true
          }
        },
        user: {
          select: {
            name: true,
            avatarUrl: true
          }
        }
      }
    })
    
    if (!review) {
      return {
        statusCode: 404,
        body: { message: 'Отзыв не найден' }
      }
    }
    
    return {
      statusCode: 200,
      body: review
    }
  } catch (error) {
    console.error('Ошибка при получении отзыва:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 