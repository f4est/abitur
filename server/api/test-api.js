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
    const config = useRuntimeConfig()
    return jwt.verify(token, config.JWT_SECRET)
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
  const url = getRequestURL(event).pathname
  
  // Получить все вопросы теста
  if (method === 'GET' && url === '/api/test-api/questions') {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    try {
      const questions = await prisma.testQuestion.findMany()
      
      // Преобразуем JSON строки в объекты JavaScript
      const formattedQuestions = questions.map(q => {
        try {
          return {
            ...q,
            options: q.options ? JSON.parse(q.options) : [],
            weights: q.weights ? JSON.parse(q.weights) : {}
          }
        } catch (e) {
          // В случае ошибки парсинга оставляем как есть
          return q
        }
      })
      
      return { 
        statusCode: 200,
        body: formattedQuestions 
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
  if (method === 'GET' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    const id = parseInt(url.split('/').pop())
    
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
      
      // Преобразуем JSON строки в объекты JavaScript
      try {
        const formattedQuestion = {
          ...question,
          options: question.options ? JSON.parse(question.options) : [],
          weights: question.weights ? JSON.parse(question.weights) : {}
        }
        
        return {
          statusCode: 200,
          body: formattedQuestion
        }
      } catch (e) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 200,
          body: question
        }
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
  if (method === 'POST' && url === '/api/test-api/questions') {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const body = await readBody(event)
    const { question, options, category, weights } = body

    if (!question || !category) {
      return {
        statusCode: 400,
        body: { message: 'Вопрос и категория обязательны для заполнения' }
      }
    }

    try {
      // Преобразуем options и weights в JSON строки
      const optionsStr = Array.isArray(options) ? JSON.stringify(options) : (options || '[]')
      const weightsStr = weights ? (typeof weights === 'string' ? weights : JSON.stringify(weights)) : '{}'

      const newQuestion = await prisma.testQuestion.create({
        data: {
          question,
          options: optionsStr,
          category,
          weights: weightsStr
        }
      })
      
      // Преобразуем обратно в объекты для ответа
      try {
        const formattedQuestion = {
          ...newQuestion,
          options: JSON.parse(newQuestion.options),
          weights: JSON.parse(newQuestion.weights)
        }
        
        return { 
          statusCode: 201, 
          body: formattedQuestion 
        }
      } catch (e) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return { 
          statusCode: 201, 
          body: newQuestion 
        }
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
  if (method === 'PUT' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const id = parseInt(url.split('/').pop())
    const body = await readBody(event)
    
    try {
      // Проверяем существование вопроса
      const existingQuestion = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!existingQuestion) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }
      
      // Готовим данные для обновления
      const updateData = {}
      
      if (body.question) {
        updateData.question = body.question
      }
      
      if (body.category) {
        updateData.category = body.category
      }
      
      if (body.options) {
        updateData.options = Array.isArray(body.options) 
          ? JSON.stringify(body.options) 
          : (typeof body.options === 'string' ? body.options : '[]')
      }
      
      if (body.weights) {
        updateData.weights = typeof body.weights === 'string' 
          ? body.weights 
          : JSON.stringify(body.weights)
      }

      const updatedQuestion = await prisma.testQuestion.update({
        where: { id },
        data: updateData
      })
      
      // Преобразуем обратно в объекты для ответа
      try {
        const formattedQuestion = {
          ...updatedQuestion,
          options: JSON.parse(updatedQuestion.options),
          weights: updatedQuestion.weights ? JSON.parse(updatedQuestion.weights) : {}
        }
        
        return { 
          statusCode: 200, 
          body: formattedQuestion 
        }
      } catch (e) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return { 
          statusCode: 200, 
          body: updatedQuestion 
        }
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
  if (method === 'DELETE' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const id = parseInt(url.split('/').pop())
    
    try {
      // Проверяем существование вопроса
      const existingQuestion = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!existingQuestion) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }

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
  if (method === 'POST' && url === '/api/test-api/results') {
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
      // Преобразуем results в JSON строку
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

  // Если запрос не соответствует ни одному из обработчиков
  return {
    statusCode: 404,
    body: { message: 'Маршрут не найден' }
  }
}) 