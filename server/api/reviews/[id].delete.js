import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем ID отзыва из параметров URL
    const id = parseInt(event.context.params.id)
    
    // Получаем данные из query-параметров (userId для проверки прав)
    const query = getQuery(event)
    const userId = query.userId ? parseInt(query.userId) : null
    
    if (!userId) {
      return {
        statusCode: 400,
        body: { message: 'Необходимо указать ID пользователя' }
      }
    }
    
    // Получаем информацию о пользователе для проверки прав
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    
    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'Пользователь не найден' }
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
    
    // Проверяем права пользователя (только автор или админ могут удалять)
    if (existingReview.userId !== userId && user.role !== 'ADMIN') {
      return {
        statusCode: 403,
        body: { message: 'Недостаточно прав для удаления данного отзыва' }
      }
    }
    
    // Удаляем отзыв
    await prisma.review.delete({
      where: { id }
    })
    
    return {
      statusCode: 200,
      body: { message: 'Отзыв успешно удален' }
    }
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 