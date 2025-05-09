import prisma from '../../utils/prisma'
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
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    // Обрабатываем методы GET, POST, PUT, DELETE
    const method = event.req.method
    const url = event.req.url
    
    // GET запрос - получение всех вопросов
    if (method === 'GET' && url.endsWith('/api/test-api/questions')) {
      // Получаем все вопросы теста
      const questions = await prisma.testQuestion.findMany()
      
      // Если вопросов нет, возвращаем пустой массив
      if (!questions || questions.length === 0) {
        return {
          statusCode: 200,
          body: []
        }
      }
      
      // Приводим JSON-строки к объектам JavaScript для удобства использования
      const formattedQuestions = questions.map(q => {
        try {
          return {
            ...q,
            options: q.options ? JSON.parse(q.options) : [],
            weights: q.weights ? JSON.parse(q.weights) : {}
          }
        } catch (e) {
          // Если произошла ошибка парсинга, возвращаем исходные строки
          return q
        }
      })
      
      return {
        statusCode: 200,
        body: formattedQuestions
      }
    }
    
    // GET запрос - получение конкретного вопроса по ID
    if (method === 'GET' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
      const id = parseInt(url.split('/').pop())
      
      if (isNaN(id)) {
        return {
          statusCode: 400,
          body: { message: 'Некорректный ID вопроса' }
        }
      }
      
      // Получаем вопрос по ID
      const question = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!question) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }
      
      // Форматируем ответ
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
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 200,
          body: question
        }
      }
    }
    
    // POST запрос - создание нового вопроса
    if (method === 'POST' && url.endsWith('/api/test-api/questions')) {
      // Проверяем права администратора
      if (!isAdmin(user)) {
        return {
          statusCode: 403,
          body: { message: 'Доступ запрещен. Требуются права администратора.' }
        }
      }
      
      // Получаем данные из тела запроса
      const body = await readBody(event)
      
      // Проверяем обязательные поля
      if (!body.question || !body.category) {
        return {
          statusCode: 400,
          body: { message: 'Поля "question" и "category" обязательны' }
        }
      }
      
      // Подготавливаем данные для сохранения
      const data = {
        question: body.question,
        category: body.category,
        options: Array.isArray(body.options) ? JSON.stringify(body.options) : '[]',
        weights: body.weights ? (typeof body.weights === 'string' ? body.weights : JSON.stringify(body.weights)) : '{}'
      }
      
      // Создаем новый вопрос
      const question = await prisma.testQuestion.create({
        data
      })
      
      // Форматируем ответ
      try {
        const formattedQuestion = {
          ...question,
          options: JSON.parse(question.options),
          weights: JSON.parse(question.weights)
        }
        
        return {
          statusCode: 201,
          body: formattedQuestion
        }
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 201,
          body: question
        }
      }
    }
    
    // PUT запрос - обновление вопроса
    if (method === 'PUT' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
      // Проверяем права администратора
      if (!isAdmin(user)) {
        return {
          statusCode: 403,
          body: { message: 'Доступ запрещен. Требуются права администратора.' }
        }
      }
      
      const id = parseInt(url.split('/').pop())
      
      if (isNaN(id)) {
        return {
          statusCode: 400,
          body: { message: 'Некорректный ID вопроса' }
        }
      }
      
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
      
      // Получаем данные из тела запроса
      const body = await readBody(event)
      
      // Подготавливаем данные для обновления
      const updateData = {}
      
      if (body.question) updateData.question = body.question
      if (body.category) updateData.category = body.category
      if (body.options) {
        updateData.options = Array.isArray(body.options) ? JSON.stringify(body.options) : body.options
      }
      if (body.weights) {
        updateData.weights = typeof body.weights === 'string' ? body.weights : JSON.stringify(body.weights)
      }
      
      // Обновляем вопрос
      const updatedQuestion = await prisma.testQuestion.update({
        where: { id },
        data: updateData
      })
      
      // Форматируем ответ
      try {
        const formattedQuestion = {
          ...updatedQuestion,
          options: updatedQuestion.options ? JSON.parse(updatedQuestion.options) : [],
          weights: updatedQuestion.weights ? JSON.parse(updatedQuestion.weights) : {}
        }
        
        return {
          statusCode: 200,
          body: formattedQuestion
        }
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 200,
          body: updatedQuestion
        }
      }
    }
    
    // DELETE запрос - удаление вопроса
    if (method === 'DELETE' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
      // Проверяем права администратора
      if (!isAdmin(user)) {
        return {
          statusCode: 403,
          body: { message: 'Доступ запрещен. Требуются права администратора.' }
        }
      }
      
      const id = parseInt(url.split('/').pop())
      
      if (isNaN(id)) {
        return {
          statusCode: 400,
          body: { message: 'Некорректный ID вопроса' }
        }
      }
      
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
      
      // Удаляем вопрос
      await prisma.testQuestion.delete({
        where: { id }
      })
      
      return {
        statusCode: 200,
        body: { message: 'Вопрос успешно удален' }
      }
    }
    
    // Если запрос не соответствует ни одному из обработчиков
    return {
      statusCode: 404,
      body: { message: 'Маршрут не найден' }
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 