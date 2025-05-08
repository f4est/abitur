import prisma from '../utils/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Проверка авторизации
const verifyToken = (event) => {
  const authHeader = event.req.headers.authorization
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
  const method = event.req.method
  const url = event.req.url

  // Получить текущего пользователя
  if (method === 'GET' && url.endsWith('/api/users/me')) {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }

    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
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

      // Исключаем пароль из ответа
      const { password, ...userWithoutPassword } = userData
      return { body: userWithoutPassword }
    } catch (error) {
      console.error('Ошибка получения пользователя:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // Обновить пользователя
  if (method === 'PUT' && url.endsWith('/api/users/me')) {
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }

    const body = await readBody(event)
    const { name, avatarUrl, password } = body
    
    const updateData = {}
    if (name) updateData.name = name
    if (avatarUrl) updateData.avatarUrl = avatarUrl
    
    // Если есть новый пароль, хешируем его
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })

      // Исключаем пароль из ответа
      const { password, ...userWithoutPassword } = updatedUser
      return { statusCode: 200, body: userWithoutPassword }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // ADMIN: получить список всех пользователей
  if (method === 'GET' && url.endsWith('/api/users')) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              savedSchools: true,
              testResults: true
            }
          }
        }
      })

      return { body: users }
    } catch (error) {
      console.error('Ошибка получения пользователей:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // ADMIN: обновить пользователя
  if (method === 'PUT' && url.match(/\/api\/users\/\d+$/)) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const id = parseInt(url.split('/').pop())
    const body = await readBody(event)
    const { name, email, role, avatarUrl } = body
    
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { 
          name, 
          email, 
          role, 
          avatarUrl 
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return { body: updatedUser }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // ADMIN: удалить пользователя
  if (method === 'DELETE' && url.match(/\/api\/users\/\d+$/)) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const id = parseInt(url.split('/').pop())
    
    try {
      await prisma.user.delete({
        where: { id }
      })

      return {
        body: { message: 'Пользователь успешно удален' }
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
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