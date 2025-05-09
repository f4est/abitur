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
    
    // Определяем метод запроса
    const method = event.req.method
    
    // GET - получение списка вопросов
    if (method === 'GET') {
      // Получаем все вопросы теста
      const questions = await prisma.testQuestion.findMany()
      
      // Преобразуем JSON-строки в объекты
      const formattedQuestions = questions.map(q => {
        try {
          return {
            ...q,
            options: q.options ? JSON.parse(q.options) : [],
            weights: q.weights ? JSON.parse(q.weights) : {}
          }
        } catch (error) {
          // В случае ошибки парсинга оставляем оригинальные данные
          return q
        }
      })
      
      return {
        statusCode: 200,
        body: formattedQuestions
      }
    }
    
    // Для создания вопросов требуются права администратора
    if (!isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    // POST - создание нового вопроса
    if (method === 'POST') {
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
      const questionData = {
        question: body.question,
        category: body.category,
        options: Array.isArray(body.options) ? JSON.stringify(body.options) : '[]',
        weights: body.weights ? (typeof body.weights === 'string' ? body.weights : JSON.stringify(body.weights)) : '{}'
      }
      
      // Создаем новый вопрос
      const newQuestion = await prisma.testQuestion.create({
        data: questionData
      })
      
      // Преобразуем JSON-строки в объекты для ответа
      try {
        const formattedQuestion = {
          ...newQuestion,
          options: JSON.parse(newQuestion.options),
          weights: newQuestion.weights ? JSON.parse(newQuestion.weights) : {}
        }
        
        return {
          statusCode: 201,
          body: formattedQuestion
        }
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 201,
          body: newQuestion
        }
      }
    }
    
    // Если метод не поддерживается
    return {
      statusCode: 405,
      body: { message: 'Метод не поддерживается' }
    }
    
  } catch (error) {
    console.error('Ошибка при обработке запроса к вопросам теста:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 