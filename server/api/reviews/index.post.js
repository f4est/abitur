import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем данные из тела запроса
    const body = await readBody(event)
    
    // Проверяем обязательные поля
    if (!body.schoolId || !body.userId || !body.rating || !body.text) {
      return {
        statusCode: 400,
        body: { message: 'Отсутствуют обязательные поля' }
      }
    }
    
    // Проверяем диапазон рейтинга (от 1 до 5)
    if (body.rating < 1 || body.rating > 5) {
      return {
        statusCode: 400,
        body: { message: 'Рейтинг должен быть от 1 до 5' }
      }
    }
    
    // Получаем информацию о пользователе для добавления имени
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { name: true, role: true }
    })
    
    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'Пользователь не найден' }
      }
    }
    
    // Проверяем существование школы
    const school = await prisma.school.findUnique({
      where: { id: body.schoolId }
    })
    
    if (!school) {
      return {
        statusCode: 404,
        body: { message: 'Учебное заведение не найдено' }
      }
    }
    
    // Для администраторов отзывы автоматически одобряются
    const isApproved = user.role === 'ADMIN'
    
    // Создаем новый отзыв
    const review = await prisma.review.create({
      data: {
        schoolId: body.schoolId,
        userId: body.userId,
        userName: user.name,
        rating: body.rating,
        text: body.text,
        isApproved
      }
    })
    
    return {
      statusCode: 201,
      body: review
    }
  } catch (error) {
    console.error('Ошибка при создании отзыва:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 