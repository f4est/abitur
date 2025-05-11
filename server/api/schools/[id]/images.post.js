import { verifyToken } from '../../../utils/auth'
import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API schools/[id]/images: Начало обработки POST-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API schools/[id]/images: Ошибка авторизации')
      return {
        statusCode: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API schools/[id]/images: Недостаточно прав')
      return {
        statusCode: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем ID школы из параметров URL
    const schoolId = parseInt(event.context.params.id)
    if (isNaN(schoolId)) {
      console.log(`API schools/[id]/images: Неверный ID школы: ${event.context.params.id}`)
      return {
        statusCode: 400,
        message: 'Неверный ID школы'
      }
    }
    
    console.log(`API schools/[id]/images: Добавление изображений для школы с ID ${schoolId}`)
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    console.log('API schools/[id]/images: Получены данные:', body)
    
    if (!Array.isArray(body.images) && !body.images) {
      console.log(`API schools/[id]/images: Неверный формат данных изображений`)
      return {
        statusCode: 400,
        message: 'Неверный формат данных. Ожидается массив изображений.'
      }
    }
    
    // Проверяем существование школы
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        images: true
      }
    })
    
    if (!existingSchool) {
      console.log(`API schools/[id]/images: Школа с ID ${schoolId} не найдена`)
      return {
        statusCode: 404,
        message: `Школа с ID ${schoolId} не найдена`
      }
    }
    
    // Определяем новый массив изображений
    let newImages = body.images;
    
    // Если существуют предыдущие изображения, добавляем новые к ним
    if (existingSchool.images && Array.isArray(existingSchool.images)) {
      // Если body.append === true, то добавляем новые к существующим
      // Иначе заменяем полностью
      if (body.append === true) {
        newImages = [...existingSchool.images, ...newImages];
      }
    }
    
    // Обновляем изображения школы
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        images: newImages
      },
      select: {
        id: true,
        images: true
      }
    })
    
    console.log(`API schools/[id]/images: Изображения успешно обновлены для школы: ${updatedSchool.id}`)
    
    return {
      message: 'Изображения школы успешно обновлены',
      data: {
        schoolId: updatedSchool.id,
        images: updatedSchool.images
      }
    }
  } catch (error) {
    console.error('API schools/[id]/images: Ошибка:', error)
    return {
      statusCode: 500,
      message: 'Ошибка при обновлении изображений школы',
      error: error.message
    }
  }
}) 