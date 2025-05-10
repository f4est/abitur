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
    
    // Получаем ID пользователя из URL
    const id = parseInt(event.context.params.id)
    if (isNaN(id)) {
      return {
        statusCode: 400,
        body: { message: 'Некорректный ID пользователя' }
      }
    }
    
    // Обрабатываем методы GET, PUT, DELETE
    const method = event.req.method
    
    // GET - получение данных пользователя
    if (method === 'GET') {
      const userData = await prisma.user.findUnique({
        where: { id },
        include: {
          savedSchools: {
            include: {
              school: true
            }
          },
          testResults: true
        }
      })
      
      if (!userData) {
        return {
          statusCode: 404,
          body: { message: 'Пользователь не найден' }
        }
      }
      
      return {
        statusCode: 200,
        body: userData
      }
    }
    
    // Проверяем права администратора для PUT и DELETE
    if (!isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    // PUT - обновление пользователя
    if (method === 'PUT') {
      const body = await readBody(event)
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: body.name,
          email: body.email,
          role: body.role
        }
      })
      
      return {
        statusCode: 200,
        body: updatedUser
      }
    }
    
    // DELETE - удаление пользователя
    if (method === 'DELETE') {
      // Проверяем существование пользователя
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          savedSchools: true,
          testResults: true
        }
      })
      
      if (!existingUser) {
        return {
          statusCode: 404,
          body: { message: 'Пользователь не найден' }
        }
      }
      
      // Удаляем связанные данные в транзакции
      await prisma.$transaction([
        prisma.savedSchool.deleteMany({ where: { userId: id } }),
        prisma.testResult.deleteMany({ where: { userId: id } }),
        prisma.user.delete({ where: { id } })
      ])
      
      return {
        statusCode: 200,
        body: { message: 'Пользователь успешно удален' }
      }
    }
    
    // Если метод не поддерживается
    return {
      statusCode: 405,
      body: { message: 'Метод не поддерживается' }
    }
    
  } catch (error) {
    console.error('Ошибка при обработке запроса к пользователю:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 