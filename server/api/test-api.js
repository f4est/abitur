import prisma from '../utils/prisma'
import jwt from 'jsonwebtoken'

// Проверка авторизации
const verifyToken = (event) => {
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Проверка прав администратора
const isAdmin = (user) => {
  return user && user.role === 'ADMIN'
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const url = getRequestURL(event)
  
  // Получить все вопросы теста
  if (method === 'GET' && url.pathname === '/api/test-api/questions') {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    try {
      const questions = await prisma.testQuestion.findMany()
      return { 
        statusCode: 200,
        body: questions 
      }
    } catch (error) {
      console.error('Ошибка получения вопросов теста:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // Получить конкретный вопрос
  if (method === 'GET' && url.pathname.match(/\/api\/test-api\/questions\/\d+$/)) {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    const id = parseInt(url.pathname.split('/').pop())
    
    try {
      const question = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!question) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }
      
      return {
        statusCode: 200,
        body: question
      }
    } catch (error) {
      console.error('Ошибка получения вопроса:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // ADMIN: создать вопрос
  if (method === 'POST' && url.pathname === '/api/test-api/questions') {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const body = await readBody(event)
    const { question, options, category, weights } = body

    if (!question || !options || !category) {
      return {
        statusCode: 400,
        body: { message: 'Все поля обязательны для заполнения' }
      }
    }

    try {
      // Преобразуем options в JSON строку, если это массив или объект
      const optionsStr = typeof options === 'string' ? options : JSON.stringify(options)
      // Преобразуем weights в JSON строку, если есть и это объект
      const weightsStr = weights ? (typeof weights === 'string' ? weights : JSON.stringify(weights)) : null

      const newQuestion = await prisma.testQuestion.create({
        data: {
          question,
          options: optionsStr,
          category,
          weights: weightsStr
        }
      })

      return { 
        statusCode: 201, 
        body: newQuestion 
      }
    } catch (error) {
      console.error('Ошибка создания вопроса:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // ADMIN: обновить вопрос
  if (method === 'PUT' && url.pathname.match(/\/api\/test-api\/questions\/\d+$/)) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const id = parseInt(url.pathname.split('/').pop())
    const body = await readBody(event)
    const { question, options, category, weights } = body

    try {
      // Преобразуем options в JSON строку, если это массив или объект
      const optionsStr = typeof options === 'string' ? options : JSON.stringify(options)
      // Преобразуем weights в JSON строку, если есть и это объект
      const weightsStr = weights ? (typeof weights === 'string' ? weights : JSON.stringify(weights)) : null

      const updatedQuestion = await prisma.testQuestion.update({
        where: { id },
        data: {
          question,
          options: optionsStr,
          category,
          weights: weightsStr
        }
      })

      return { 
        statusCode: 200, 
        body: updatedQuestion 
      }
    } catch (error) {
      console.error('Ошибка обновления вопроса:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // ADMIN: удалить вопрос
  if (method === 'DELETE' && url.pathname.match(/\/api\/test-api\/questions\/\d+$/)) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const id = parseInt(url.pathname.split('/').pop())
    
    try {
      await prisma.testQuestion.delete({
        where: { id }
      })

      return {
        statusCode: 200,
        body: { message: 'Вопрос успешно удален' }
      }
    } catch (error) {
      console.error('Ошибка удаления вопроса:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // Сохранить результаты теста
  if (method === 'POST' && url.pathname === '/api/test-api/results') {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }

    const body = await readBody(event)
    const { results } = body

    if (!results) {
      return {
        statusCode: 400,
        body: { message: 'Результаты теста обязательны' }
      }
    }

    try {
      // Преобразуем results в JSON строку, если это объект
      const resultsStr = typeof results === 'string' ? results : JSON.stringify(results)

      const testResult = await prisma.testResult.create({
        data: {
          userId: user.id,
          results: resultsStr
        }
      })

      return { 
        statusCode: 201, 
        body: testResult 
      }
    } catch (error) {
      console.error('Ошибка сохранения результатов теста:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // Получить результаты теста для текущего пользователя
  if (method === 'GET' && url.pathname === '/api/test-api/results') {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }

    try {
      const results = await prisma.testResult.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return { 
        statusCode: 200, 
        body: results 
      }
    } catch (error) {
      console.error('Ошибка получения результатов теста:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // Если запрос не соответствует ни одному из обработчиков
  return {
    statusCode: 404,
    body: { message: 'Маршрут не найден' }
  }
}) 