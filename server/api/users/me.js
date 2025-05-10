import { prisma } from '~/server/db/prisma'
import { verifyToken } from '~/server/utils/auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  // Проверяем метод запроса
  const method = event.req.method
  console.log(`Обработка ${method} запроса в users/me.js`)
  
  try {
    // Проверяем авторизацию
    const tokenUser = await verifyToken(event)
    console.log('Данные пользователя из токена:', tokenUser)
    
    if (!tokenUser) {
      console.error('Ошибка авторизации: токен отсутствует или недействителен')
      return createError({
        statusCode: 401,
        message: 'Необходима авторизация'
      })
    }

    // Защита от неверного ID
    if (!tokenUser.id || isNaN(parseInt(tokenUser.id))) {
      console.error('Недопустимый ID пользователя в токене:', tokenUser.id)
      return createError({
        statusCode: 400,
        message: 'Некорректный идентификатор пользователя'
      })
    }

    // Получаем данные пользователя из базы данных
    try {
      const user = await prisma.user.findUnique({
        where: { id: tokenUser.id },
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
        console.error(`Пользователь с ID ${tokenUser.id} не найден в базе данных`)
        return createError({
          statusCode: 404,
          message: 'Пользователь не найден'
        })
      }

      console.log('Данные пользователя найдены в БД, роль:', user.role)
      
      // Проверяем, совпадает ли роль в токене с ролью в БД
      if (tokenUser.role !== user.role) {
        console.log(`Обнаружено несоответствие ролей. В токене: ${tokenUser.role}, в БД: ${user.role}`)
        console.log('Обновляем данные в токене...')
        
        // Создаем новый токен с обновленной ролью
        const config = useRuntimeConfig()
        if (!config.JWT_SECRET) {
          console.error('Ошибка: секретный ключ JWT не найден в конфигурации')
          return createError({
            statusCode: 500,
            message: 'Ошибка конфигурации сервера'
          })
        }
        
        try {
          const newToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.JWT_SECRET,
            { expiresIn: '7d' }
          )
          
          // Добавляем токен в заголовок ответа
          event.node.res.setHeader('X-New-Token', newToken)
        } catch (jwtError) {
          console.error('Ошибка при создании нового токена:', jwtError)
          // Продолжаем выполнение даже при ошибке создания токена
        }
      }

      // Возвращаем данные пользователя напрямую
      return user
    } catch (dbError) {
      console.error('Ошибка запроса к базе данных:', dbError)
      return createError({
        statusCode: 500,
        message: 'Ошибка базы данных',
        detail: dbError.message
      })
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error)
    return createError({
      statusCode: 500,
      message: 'Внутренняя ошибка сервера',
      detail: error.message
    })
  }
}) 