import { prisma } from '~/server/db/prisma'
import { verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = event.method
  const id = event.context.params.id

  // Проверяем существование школы
  const school = await prisma.school.findUnique({
    where: { id }
  })

  if (!school) {
    return {
      statusCode: 404,
      body: { message: 'Школа не найдена' }
    }
  }

  // GET - получение всех отзывов школы
  if (method === 'GET') {
    const reviews = await prisma.review.findMany({
      where: { schoolId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      statusCode: 200,
      body: reviews
    }
  }

  // POST - добавление нового отзыва
  if (method === 'POST') {
    // Проверяем авторизацию
    const user = await verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Необходима авторизация' }
      }
    }

    const body = await readBody(event)
    const { text, rating } = body

    if (!text || !rating) {
      return {
        statusCode: 400,
        body: { message: 'Текст и оценка обязательны' }
      }
    }

    if (rating < 1 || rating > 5) {
      return {
        statusCode: 400,
        body: { message: 'Оценка должна быть от 1 до 5' }
      }
    }

    const review = await prisma.review.create({
      data: {
        text,
        rating,
        schoolId: id,
        userId: user.id,
        authorName: user.name
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      statusCode: 201,
      body: review
    }
  }

  // DELETE - удаление отзыва
  if (method === 'DELETE') {
    // Проверяем авторизацию
    const user = await verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Необходима авторизация' }
      }
    }

    const { reviewId } = await readBody(event)

    if (!reviewId) {
      return {
        statusCode: 400,
        body: { message: 'ID отзыва обязателен' }
      }
    }

    // Проверяем, что отзыв принадлежит пользователю или пользователь - админ
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return {
        statusCode: 404,
        body: { message: 'Отзыв не найден' }
      }
    }

    if (review.userId !== user.id && !user.isAdmin) {
      return {
        statusCode: 403,
        body: { message: 'Нет прав на удаление этого отзыва' }
      }
    }

    await prisma.review.delete({
      where: {
        id: reviewId,
        schoolId: id
      }
    })

    return {
      statusCode: 200,
      body: { message: 'Отзыв успешно удален' }
    }
  }

  return {
    statusCode: 405,
    body: { message: 'Метод не поддерживается' }
  }
}) 