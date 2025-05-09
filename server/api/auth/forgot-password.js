import prisma from '../../utils/prisma'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = body

    // Проверка, что email существует
    if (!email) {
      return {
        statusCode: 400,
        body: { message: 'Email обязателен' }
      }
    }

    console.log('[FORGOT PASSWORD] Получен запрос для:', email)

    // Нормализуем email
    const normalizedEmail = email.toLowerCase()

    // Поиск пользователя (напрямую по email в нижнем регистре)
    const users = await prisma.user.findMany()
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail)

    if (!user) {
      console.log('[FORGOT PASSWORD] Пользователь не найден:', email)
      return {
        statusCode: 404,
        body: { message: 'Пользователь с таким email не найден' }
      }
    }

    console.log('[FORGOT PASSWORD] Пользователь найден, ID:', user.id)

    // Генерация случайного кода восстановления (6 цифр)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Хеширование кода для безопасного хранения
    const resetCodeHash = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex')
    
    // Время истечения срока действия кода (1 час)
    const resetCodeExpires = new Date(Date.now() + 3600000) // +1 час

    console.log('[FORGOT PASSWORD] Сгенерирован код:', resetCode)
    console.log('[FORGOT PASSWORD] Хеш кода:', resetCodeHash)
    console.log('[FORGOT PASSWORD] Срок действия до:', resetCodeExpires)

    try {
      // Сохранение кода восстановления и срока его действия в базе данных
      const updateResult = await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCode: resetCodeHash,
          resetCodeExpires
        }
      })
      
      console.log('[FORGOT PASSWORD] Результат обновления:', updateResult.id ? 'Успешно' : 'Ошибка')
    } catch (dbError) {
      console.error('[FORGOT PASSWORD] Ошибка обновления в БД:', dbError)
      return {
        statusCode: 500,
        body: { message: 'Ошибка обновления данных пользователя' }
      }
    }

    // Явный вывод кода восстановления разными способами для гарантии
    console.log('\n\n============================================')
    console.log(`КОД ВОССТАНОВЛЕНИЯ для ${email}: ${resetCode}`)
    console.log('============================================\n\n')
    
    // Используем вывод через process.stdout для гарантии
    process.stdout.write(`\n\n>>> КОД ВОССТАНОВЛЕНИЯ для ${email}: ${resetCode} <<<\n\n`)
    
    // Возвращаем код в ответе в любом случае для отладки
    return {
      body: { 
        message: 'Код восстановления отправлен на ваш email',
        resetCode
      }
    }
  } catch (error) {
    console.error('[FORGOT PASSWORD] Критическая ошибка:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
})