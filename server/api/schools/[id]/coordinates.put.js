import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем ID школы из параметров URL
    const id = parseInt(event.context.params.id)
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    
    // Проверяем наличие обязательных полей
    if (!body.coordinates || !body.adminId) {
      return {
        statusCode: 400,
        body: { message: 'Отсутствуют обязательные поля' }
      }
    }
    
    // Проверяем права пользователя (должен быть администратором)
    const admin = await prisma.user.findUnique({
      where: { id: body.adminId },
      select: { role: true }
    })
    
    if (!admin || admin.role !== 'ADMIN') {
      return {
        statusCode: 403,
        body: { message: 'Недостаточно прав для выполнения этой операции' }
      }
    }
    
    // Проверяем существование школы
    const existingSchool = await prisma.school.findUnique({
      where: { id }
    })
    
    if (!existingSchool) {
      return {
        statusCode: 404,
        body: { message: 'Учебное заведение не найдено' }
      }
    }
    
    // Валидация координат (должны быть в формате "lat,lng")
    const coordinates = body.coordinates.trim()
    const coordsPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/
    
    if (!coordsPattern.test(coordinates)) {
      return {
        statusCode: 400,
        body: { message: 'Неверный формат координат. Используйте формат "lat,lng", например: "43.238949,76.889709"' }
      }
    }
    
    // Обновляем координаты
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: {
        coordinates
      }
    })
    
    return {
      statusCode: 200,
      body: updatedSchool
    }
  } catch (error) {
    console.error('Ошибка при обновлении координат:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 