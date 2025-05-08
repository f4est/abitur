import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем ID отзыва из параметров URL
    const id = parseInt(event.context.params.id)
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    
    // Проверяем наличие обязательных полей
    if (body.isApproved === undefined || !body.adminId) {
      return {
        statusCode: 400,
        body: { message: 'Отсутствуют обязательные поля' }
      }
    }
    
    // Проверяем, является ли пользователь администратором
    const admin = await prisma.user.findUnique({
      where: { id: body.adminId },
      select: { role: true }
    })
    
    if (!admin || admin.role !== 'ADMIN') {
      return {
        statusCode: 403,
        body: { message: 'Недостаточно прав для выполнения этой операции' }
      }
    }
    
    // Проверяем существование отзыва
    const existingReview = await prisma.review.findUnique({
      where: { id }
    })
    
    if (!existingReview) {
      return {
        statusCode: 404,
        body: { message: 'Отзыв не найден' }
      }
    }
    
    // Обновляем статус отзыва
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isApproved: body.isApproved
      }
    })
    
    return {
      statusCode: 200,
      body: updatedReview
    }
  } catch (error) {
    console.error('Ошибка при модерации отзыва:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 