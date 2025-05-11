import { verifyToken } from '../../../utils/auth'
import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API schools/[id]/programs: Начало обработки PUT-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API schools/[id]/programs: Ошибка авторизации')
      return {
        statusCode: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API schools/[id]/programs: Недостаточно прав')
      return {
        statusCode: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем ID школы из параметров URL
    const schoolId = parseInt(event.context.params.id)
    if (isNaN(schoolId)) {
      console.log(`API schools/[id]/programs: Неверный ID школы: ${event.context.params.id}`)
      return {
        statusCode: 400,
        message: 'Неверный ID школы'
      }
    }
    
    console.log(`API schools/[id]/programs: Обновление программ для школы с ID ${schoolId}`)
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    console.log('API schools/[id]/programs: Получены данные:', body)
    
    if (!Array.isArray(body.programs)) {
      console.log(`API schools/[id]/programs: Неверный формат данных программ`)
      return {
        statusCode: 400,
        message: 'Неверный формат данных. Ожидается массив программ.'
      }
    }
    
    // Проверяем существование школы
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId }
    })
    
    if (!existingSchool) {
      console.log(`API schools/[id]/programs: Школа с ID ${schoolId} не найдена`)
      return {
        statusCode: 404,
        message: `Школа с ID ${schoolId} не найдена`
      }
    }
    
    // Обновляем информацию о программах школы
    // В этом примере мы просто сохраняем весь массив программ
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        educationalPrograms: body.programs
      }
    })
    
    console.log(`API schools/[id]/programs: Программы успешно обновлены для школы: ${updatedSchool.id}`)
    
    return {
      message: 'Образовательные программы успешно обновлены',
      data: {
        schoolId: updatedSchool.id,
        programs: updatedSchool.educationalPrograms
      }
    }
  } catch (error) {
    console.error('API schools/[id]/programs: Ошибка:', error)
    return {
      statusCode: 500,
      message: 'Ошибка при обновлении образовательных программ',
      error: error.message
    }
  }
}) 