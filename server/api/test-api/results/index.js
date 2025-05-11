import prisma from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

// Проверка авторизации
const verifyToken = (event) => {
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    const method = event.req.method
    
    // GET запрос - получение результатов теста для текущего пользователя
    if (method === 'GET') {
      const testResults = await prisma.testResult.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      return {
        statusCode: 200,
        body: testResults
      }
    }
    
    // POST запрос - сохранение результатов теста
    if (method === 'POST') {
      const body = await readBody(event)
      
      if (!body.results) {
        return {
          statusCode: 400,
          body: { message: 'Отсутствуют результаты теста' }
        }
      }
      
      // Создаем новую запись о результатах теста
      const testResult = await prisma.testResult.create({
        data: {
          userId: user.id,
          results: body.results
        }
      })
      
      return {
        statusCode: 201,
        body: testResult
      }
    }
    
    // Если метод не соответствует ни одному из обработчиков
    return {
      statusCode: 405,
      body: { message: 'Метод не поддерживается' }
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 