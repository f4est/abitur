import prisma from '../utils/prisma'
import bcrypt from 'bcrypt'
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
    console.log('Получен PUT запрос к /api/users/me')
    
    const user = verifyToken(event)
    if (!user) {
      console.log('Ошибка авторизации: нет действительного токена')
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    console.log('Пользователь авторизован, ID:', user.id)

    try {
      const body = await readBody(event)
      console.log('Получены данные для обновления:', body)
      
      const { name, avatarUrl, password } = body
      
      const updateData = {}
      if (name) updateData.name = name
      if (avatarUrl) updateData.avatarUrl = avatarUrl
      
      console.log('Данные для обновления после обработки:', updateData)
      
      // Если есть новый пароль, хешируем его
      if (password) {
        updateData.password = await bcrypt.hash(password, 10)
        console.log('Пароль хеширован и добавлен в данные для обновления')
      }

      console.log('Выполняем обновление пользователя в БД')
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })
      console.log('Пользователь успешно обновлен в БД')

      // Исключаем пароль из ответа
      const { password: _, ...userWithoutPassword } = updatedUser
      console.log('Отправляем обновленные данные пользователя клиенту:', userWithoutPassword)
      
      return { statusCode: 200, body: userWithoutPassword }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      return {
        statusCode: 500,
        body: { message: `Внутренняя ошибка сервера: ${error.message}` }
      }
    }
  }

  // ADMIN: получить список всех пользователей
  if (method === 'GET' && url === '/api/users') {
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

      return { 
        statusCode: 200,
        body: users || [],
        total: users ? users.length : 0
      }
    } catch (error) {
      console.error('Ошибка получения пользователей:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера' }
      }
    }
  }

  // ADMIN: получить конкретного пользователя по ID
  if (method === 'GET' && url.match(/\/api\/users\/\d+$/)) {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const id = parseInt(url.split('/').pop())
    
    try {
      const userData = await prisma.user.findUnique({
        where: { id },
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
    } catch (error) {
      console.error('Ошибка получения пользователя:', error)
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
    const { name, email, role, password, avatarUrl } = body
    
    try {
      const updateData = {}
      if (name) updateData.name = name
      if (email) updateData.email = email
      if (role) updateData.role = role 
      if (avatarUrl) updateData.avatarUrl = avatarUrl
      
      // Если указан пароль - хешируем его
      if (password) {
        updateData.password = await bcrypt.hash(password, 10)
      }
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
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

      return { 
        statusCode: 200,
        body: updatedUser 
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера', error: error.message }
      }
    }
  }

  // ADMIN: создать пользователя
  if (method === 'POST' && url === '/api/users') {
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }

    const body = await readBody(event)
    const { name, email, password, role } = body
    
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        body: { message: 'Имя, email и пароль обязательны' }
      }
    }
    
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        return {
          statusCode: 400,
          body: { message: 'Пользователь с таким email уже существует' }
        }
      }
      
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Создаем пользователя
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'USER'
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
      
      return {
        statusCode: 201,
        body: newUser
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера', error: error.message }
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
      // Проверяем, что пользователь существует
      const existingUser = await prisma.user.findUnique({
        where: { id }
      })
      
      if (!existingUser) {
        return {
          statusCode: 404,
          body: { message: 'Пользователь не найден' }
        }
      }
      
      // Удаляем пользователя
      await prisma.user.delete({
        where: { id }
      })

      return {
        statusCode: 200,
        body: { message: 'Пользователь успешно удален' }
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
      return {
        statusCode: 500,
        body: { message: 'Внутренняя ошибка сервера', error: error.message }
      }
    }
  }

  // Если запрос не соответствует ни одному из обработчиков
  return {
    statusCode: 404,
    body: { message: 'Маршрут не найден' }
  }
}) 