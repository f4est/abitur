import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем ID отзыва из параметров URL
    const id = parseInt(event.context.params.id)
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    
    // Проверяем существование отзыва
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: { user: { select: { role: true } } }
    })
    
    if (!existingReview) {
      return {
        statusCode: 404,
        body: { message: 'Отзыв не найден' }
      }
    }
    
    // Проверяем права пользователя (только автор или админ могут редактировать)
    if (body.userId && body.userId !== existingReview.userId && existingReview.user.role !== 'ADMIN') {
      return {
        statusCode: 403,
        body: { message: 'Недостаточно прав для редактирования данного отзыва' }
      }
    }
    
    // Проверяем диапазон рейтинга (от 1 до 5), если он указан
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return {
        statusCode: 400,
        body: { message: 'Рейтинг должен быть от 1 до 5' }
      }
    }
    
    // Подготавливаем данные для обновления
    const updateData = {}
    
    if (body.rating) updateData.rating = body.rating
    if (body.text) updateData.text = body.text
    
    // Админ может менять статус одобрения
    if (body.isApproved !== undefined && existingReview.user.role === 'ADMIN') {
      updateData.isApproved = body.isApproved
    }
    
    // Обновляем отзыв
    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData
    })
    
    return {
      statusCode: 200,
      body: updatedReview
    }
  } catch (error) {
    console.error('Ошибка при обновлении отзыва:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 