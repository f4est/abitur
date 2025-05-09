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
    
    // Получаем ID вопроса из URL
    const id = parseInt(event.context.params.id)
    if (isNaN(id)) {
      return {
        statusCode: 400,
        body: { message: 'Некорректный ID вопроса' }
      }
    }
    
    // Определяем метод запроса
    const method = event.req.method
    
    // GET - получение данных вопроса
    if (method === 'GET') {
      const questionData = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!questionData) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }
      
      // Преобразуем JSON-строки в объекты
      try {
        const formattedQuestion = {
          ...questionData,
          options: questionData.options ? JSON.parse(questionData.options) : [],
          weights: questionData.weights ? JSON.parse(questionData.weights) : {}
        }
        
        return {
          statusCode: 200,
          body: formattedQuestion
        }
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 200,
          body: questionData
        }
      }
    }
    
    // Проверяем права администратора для методов PUT и DELETE
    if (!isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    // PUT - обновление вопроса
    if (method === 'PUT') {
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
        updateData.options = Array.isArray(body.options) 
          ? JSON.stringify(body.options) 
          : (typeof body.options === 'string' ? body.options : '[]')
      }
      
      if (body.weights) {
        updateData.weights = typeof body.weights === 'string' 
          ? body.weights 
          : JSON.stringify(body.weights)
      }
      
      // Обновляем вопрос
      const updatedQuestion = await prisma.testQuestion.update({
        where: { id },
        data: updateData
      })
      
      // Преобразуем JSON-строки в объекты для ответа
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
    
    // DELETE - удаление вопроса
    if (method === 'DELETE') {
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
    
    // Если метод не поддерживается
    return {
      statusCode: 405,
      body: { message: 'Метод не поддерживается' }
    }
    
  } catch (error) {
    console.error('Ошибка при обработке запроса к вопросу теста:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 