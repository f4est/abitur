import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  // Проверяем метод запроса
  const method = event.req.method
  console.log(`Обработка ${method} запроса в users/me.js`)
  
  try {
    // Получаем токен из заголовка авторизации
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Ошибка авторизации: нет или неверный формат токена')
      return {
        statusCode: 401,
        body: { message: 'Токен авторизации отсутствует или неверного формата' }
      }
    }

    const token = authHeader.split(' ')[1]
    const config = useRuntimeConfig()

    // Проверяем токен
    const decoded = jwt.verify(token, config.JWT_SECRET)
    console.log('Пользователь авторизован, ID:', decoded.id)
    
    // GET запрос - получение данных пользователя
    if (method === 'GET') {
      // Получаем данные пользователя из базы данных
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          savedSchools: {
            include: {
              school: true
            }
          },
          testResults: true
        }
      })

      if (!user) {
        console.log('Пользователь не найден в БД')
        return {
          statusCode: 404,
          body: { message: 'Пользователь не найден' }
        }
      }

      // Проверка на admin@gmail.com и принудительная установка роли ADMIN
      if (user.email && user.email.toLowerCase() === 'admin@gmail.com') {
        console.log('GET /users/me: Обнаружен пользователь admin@gmail.com, устанавливаем роль ADMIN')
        user.role = 'ADMIN'
        // Обновляем роль пользователя в базе данных
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
          })
          console.log('Роль пользователя обновлена в базе данных')
        } catch (updateError) {
          console.error('Ошибка при обновлении роли пользователя:', updateError)
        }
      }

      console.log('Данные пользователя успешно получены, роль:', user.role)
      return {
        body: user
      }
    }
    
    // PUT запрос - обновление данных пользователя
    if (method === 'PUT') {
      console.log('Обрабатываем PUT запрос для обновления профиля')
      
      // Читаем данные из тела запроса
      const body = await readBody(event)
      console.log('Получены данные для обновления:', body)
      
      const { name, avatarUrl, password } = body
      
      // Формируем объект с данными для обновления
      const updateData = {}
      if (name) updateData.name = name
      if (avatarUrl) updateData.avatarUrl = avatarUrl
      
      console.log('Данные для обновления после обработки:', updateData)
      
      // Если указан новый пароль, хешируем его
      if (password) {
        updateData.password = await bcrypt.hash(password, 10)
        console.log('Пароль хеширован и добавлен в данные для обновления')
      }
      
      // Обновляем данные пользователя в БД
      console.log('Выполняем обновление пользователя в БД')
      const updatedUser = await prisma.user.update({
        where: { id: decoded.id },
        data: updateData
      })
      
      console.log('Пользователь успешно обновлен в БД')
      
      // Проверка на admin@gmail.com и принудительная установка роли ADMIN
      if (updatedUser.email && updatedUser.email.toLowerCase() === 'admin@gmail.com' && updatedUser.role !== 'ADMIN') {
        console.log('PUT /users/me: Обнаружен пользователь admin@gmail.com, устанавливаем роль ADMIN')
        await prisma.user.update({
          where: { id: updatedUser.id },
          data: { role: 'ADMIN' }
        })
        updatedUser.role = 'ADMIN'
        console.log('Роль пользователя обновлена на ADMIN')
      }
      
      // Исключаем пароль из ответа
      const { password: _, ...userWithoutPassword } = updatedUser
      
      // Возвращаем обновленные данные
      return {
        body: userWithoutPassword
      }
    }
    
    // Если метод не GET и не PUT
    return {
      statusCode: 405,
      body: { message: 'Метод не поддерживается' }
    }
    
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        body: { message: 'Недействительный или истекший токен' }
      }
    }
    
    if (error.code === 'P2025') {
      return {
        statusCode: 404,
        body: { message: 'Пользователь не найден' }
      }
    }
    
    return {
      statusCode: 500,
      body: { message: `Внутренняя ошибка сервера: ${error.message}` }
    }
  }
}) 