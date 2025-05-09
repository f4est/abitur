import prisma from '../../utils/prisma'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, resetCode, newPassword } = body

    // Проверка обязательных полей
    if (!email || !resetCode || !newPassword) {
      return {
        statusCode: 400,
        body: { message: 'Все поля обязательны для заполнения' }
      }
    }

    // Преобразуем email в нижний регистр
    const emailLower = email.toLowerCase()

    // Хеширование введенного кода для сравнения с хранящимся
    const resetCodeHash = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex')

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    })

    if (!user) {
      return {
        statusCode: 404,
        body: { message: 'Пользователь не найден' }
      }
    }

    // Проверка кода восстановления
    if (!user.resetCode || user.resetCode !== resetCodeHash) {
      return {
        statusCode: 400,
        body: { message: 'Неверный код восстановления' }
      }
    }

    // Проверка срока действия кода
    if (!user.resetCodeExpires || new Date() > new Date(user.resetCodeExpires)) {
      return {
        statusCode: 400,
        body: { message: 'Код восстановления истек. Запросите новый код.' }
      }
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Обновление пароля и сброс данных восстановления
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      }
    })

    return {
      body: { message: 'Пароль успешно изменен' }
    }
  } catch (error) {
    console.error('Ошибка сброса пароля:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 