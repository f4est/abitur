import { prisma } from '~/server/db/prisma'
import { verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const method = event.method
  const id = event.context.params.id

  // Проверяем авторизацию
  const user = await verifyToken(event)
  if (!user) {
    return {
      statusCode: 401,
      body: { message: 'Необходима авторизация' }
    }
  }

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

  // GET - получение всех фотографий школы
  if (method === 'GET') {
    const photos = await prisma.schoolPhoto.findMany({
      where: { schoolId: id },
      orderBy: { createdAt: 'desc' }
    })

    return {
      statusCode: 200,
      body: photos
    }
  }

  // POST - добавление новой фотографии
  if (method === 'POST') {
    const body = await readBody(event)
    const { url, description } = body

    if (!url) {
      return {
        statusCode: 400,
        body: { message: 'URL фотографии обязателен' }
      }
    }

    const photo = await prisma.schoolPhoto.create({
      data: {
        url,
        description: description || '',
        schoolId: id
      }
    })

    return {
      statusCode: 201,
      body: photo
    }
  }

  // DELETE - удаление фотографии
  if (method === 'DELETE') {
    const { photoId } = await readBody(event)

    if (!photoId) {
      return {
        statusCode: 400,
        body: { message: 'ID фотографии обязателен' }
      }
    }

    await prisma.schoolPhoto.delete({
      where: {
        id: photoId,
        schoolId: id
      }
    })

    return {
      statusCode: 200,
      body: { message: 'Фотография успешно удалена' }
    }
  }

  return {
    statusCode: 405,
    body: { message: 'Метод не поддерживается' }
  }
}) 