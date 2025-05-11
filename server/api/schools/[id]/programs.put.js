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
    
    // Получаем текущие программы школы
    const currentPrograms = await prisma.educationalProgram.findMany({
      where: { schoolId: schoolId }
    })
    
    // Обрабатываем каждую программу из запроса
    const processedPrograms = [];
    
    for (const program of body.programs) {
      // Проверяем наличие обязательных полей
      if (!program.name) {
        console.log('API schools/[id]/programs: Отсутствует обязательное поле name')
        continue; // Пропускаем программы без названия
      }
      
      // Подготавливаем данные для обновления или создания
      const programData = {
        name: program.name,
        description: program.description || null,
        code: program.code || null,
        duration: program.duration || null,
        price: program.price ? parseFloat(program.price) : null,
        category: program.category || null,
        schoolId: schoolId
      }
      
      // Если есть требования к экзаменам, сохраняем их в JSON
      if (program.examRequirements && Array.isArray(program.examRequirements)) {
        programData.examRequirements = JSON.stringify(program.examRequirements)
      }
      
      // Если программа уже существует, обновляем её
      if (program.id) {
        const programId = parseInt(program.id)
        try {
          const updatedProgram = await prisma.educationalProgram.update({
            where: { 
              id: programId,
              schoolId: schoolId // Проверяем, что программа принадлежит этой школе
            },
            data: programData
          })
          processedPrograms.push(updatedProgram)
          console.log(`API schools/[id]/programs: Обновлена программа ID ${programId}`)
        } catch (error) {
          console.error(`API schools/[id]/programs: Ошибка обновления программы ID ${programId}:`, error)
        }
      }
      // Иначе создаем новую программу
      else {
        try {
          const newProgram = await prisma.educationalProgram.create({
            data: programData
          })
          processedPrograms.push(newProgram)
          console.log(`API schools/[id]/programs: Создана новая программа ID ${newProgram.id}`)
        } catch (error) {
          console.error(`API schools/[id]/programs: Ошибка создания программы:`, error)
        }
      }
    }
    
    // Получаем обновленный список программ
    const updatedPrograms = await prisma.educationalProgram.findMany({
      where: { schoolId: schoolId }
    })
    
    console.log(`API schools/[id]/programs: Программы успешно обновлены для школы ID ${schoolId}. Всего программ: ${updatedPrograms.length}`)
    
    return {
      message: 'Образовательные программы успешно обновлены',
      data: {
        schoolId: schoolId,
        programs: updatedPrograms
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