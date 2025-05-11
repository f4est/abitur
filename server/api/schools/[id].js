import { prisma } from '~/server/db/prisma'
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
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    // Получаем ID школы из URL
    const id = parseInt(event.context.params.id)
    if (isNaN(id)) {
      return {
        statusCode: 400,
        body: { message: 'Некорректный ID школы' }
      }
    }
    
    // Обрабатываем методы GET, PUT, DELETE
    const method = event.req.method
    
    // GET - получение конкретной школы
    if (method === 'GET') {
      const school = await prisma.school.findUnique({
        where: { id },
        include: {
          programs: true,
          photos: true,
          _count: {
            select: {
              reviews: true,
              savedByUsers: true
            }
          }
        }
      })
      
      if (!school) {
        return {
          statusCode: 404,
          body: { message: 'Школа не найдена' }
        }
      }
      
      // Извлекаем email и телефон из поля contacts, если они есть
      let email = '';
      let phone = '';
      
      if (school.contacts) {
        const emailMatch = school.contacts.match(/Email: ([^,]+)/i);
        if (emailMatch && emailMatch[1]) {
          email = emailMatch[1].trim();
        }
        
        const phoneMatch = school.contacts.match(/Телефон: ([^,]+)/i);
        if (phoneMatch && phoneMatch[1]) {
          phone = phoneMatch[1].trim();
        }
      }
      
      // Форматируем ответ, добавляя поля email и phone для удобства клиента
      const formattedSchool = {
        ...school,
        email,
        phone
      };
      
      return {
        statusCode: 200,
        body: formattedSchool
      }
    }
    
    // Проверяем права администратора для PUT и DELETE
    if (!isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    // PUT - обновление школы
    if (method === 'PUT') {
      // Проверяем существование школы
      const existingSchool = await prisma.school.findUnique({
        where: { id },
        include: {
          programs: true,
          photos: true
        }
      })
      
      if (!existingSchool) {
        return {
          statusCode: 404,
          body: { message: 'Школа не найдена' }
        }
      }
      
      // Получаем данные из тела запроса
      const body = await readBody(event)
      
      // Извлекаем данные о программах для отдельной обработки
      const { programs, photos, externalReviews, ...schoolData } = body
      
      // Обрабатываем координаты
      if (schoolData.coordinates && typeof schoolData.coordinates === 'object') {
        schoolData.coordinates = `${schoolData.coordinates.lat},${schoolData.coordinates.lng}`
      }
      
      // Обновляем основные данные школы
      const updatedSchool = await prisma.school.update({
        where: { id },
        data: schoolData
      })
      
      // Если есть данные о фотографиях, обновляем их
      if (Array.isArray(photos)) {
        // Получаем существующие ID фотографий
        const existingPhotoIds = existingSchool.photos.map(p => p.id).filter(Boolean)
        
        // Находим ID фотографий из запроса
        const photoIdsToKeep = photos
          .filter(p => p.id)
          .map(p => p.id)
        
        // ID фотографий, которые нужно удалить
        const photoIdsToDelete = existingPhotoIds.filter(id => !photoIdsToKeep.includes(id))
        
        // Удаляем фотографии, которых нет в запросе
        if (photoIdsToDelete.length > 0) {
          await prisma.schoolPhoto.deleteMany({
            where: {
              id: {
                in: photoIdsToDelete
              }
            }
          })
        }
        
        // Обновляем существующие фотографии и добавляем новые
        for (const photo of photos) {
          if (photo.id) {
            // Обновляем существующую фотографию
            await prisma.schoolPhoto.update({
              where: { id: photo.id },
              data: {
                url: photo.url,
                description: photo.description || null
              }
            })
          } else if (photo.url) {
            // Создаем новую фотографию
            await prisma.schoolPhoto.create({
              data: {
                url: photo.url,
                description: photo.description || null,
                schoolId: id
              }
            })
          }
        }
      }
      
      // Если есть данные о программах, обновляем их
      if (Array.isArray(programs)) {
        // Получаем существующие ID программ
        const existingProgramIds = existingSchool.programs.map(p => p.id)
        
        // Определяем какие программы нужно обновить, а какие создать
        const programsToUpdate = programs
          .filter(p => p.id && existingProgramIds.includes(p.id))
        
        const programsToCreate = programs
          .filter(p => !p.id || !existingProgramIds.includes(p.id))
        
        // ID программ, которые мы собираемся обновить
        const programIdsToUpdate = programsToUpdate.map(p => p.id)
        
        // Программы, которые нужно удалить (те, что есть в базе, но нет в запросе)
        const programIdsToDelete = existingProgramIds.filter(id => !programIdsToUpdate.includes(id))
        
        // Удаляем программы, которых нет в запросе
        if (programIdsToDelete.length > 0) {
          await prisma.educationalProgram.deleteMany({
            where: {
              id: {
                in: programIdsToDelete
              }
            }
          })
        }
        
        // Обновляем существующие программы
        for (const program of programsToUpdate) {
          // Форматируем examRequirements в JSON-строку
          let examRequirementsJson = null
          if (program.examRequirements && Array.isArray(program.examRequirements)) {
            examRequirementsJson = JSON.stringify(program.examRequirements)
          }
          
          await prisma.educationalProgram.update({
            where: { id: program.id },
            data: {
              name: program.name,
              code: program.code || null,
              description: program.description || null,
              duration: program.duration || null,
              price: program.price ? parseFloat(program.price) : null,
              category: program.category || null,
              examRequirements: examRequirementsJson
            }
          })
        }
        
        // Создаем новые программы
        for (const program of programsToCreate) {
          if (program.name && program.name.trim()) {
            // Форматируем examRequirements в JSON-строку
            let examRequirementsJson = null
            if (program.examRequirements && Array.isArray(program.examRequirements)) {
              examRequirementsJson = JSON.stringify(program.examRequirements)
            }
            
            await prisma.educationalProgram.create({
              data: {
                name: program.name.trim(),
                code: program.code || null,
                description: program.description || null,
                duration: program.duration || null,
                price: program.price ? parseFloat(program.price) : null,
                category: program.category || null,
                examRequirements: examRequirementsJson,
                schoolId: id
              }
            })
          }
        }
      }
      
      // Если есть данные о внешних отзывах, создаем их
      if (Array.isArray(externalReviews) && externalReviews.length > 0) {
        for (const review of externalReviews) {
          await prisma.review.create({
            data: {
              text: review.text,
              rating: review.rating,
              authorName: review.authorName,
              source: review.source || '2GIS',
              isExternal: true,
              isApproved: true, // Внешние отзывы автоматически одобряются
              schoolId: id
            }
          })
        }
      }
      
      // Получаем обновленные данные школы
      const fullUpdatedSchool = await prisma.school.findUnique({
        where: { id },
        include: {
          programs: true,
          photos: true,
          _count: {
            select: {
              reviews: true,
              savedByUsers: true
            }
          }
        }
      })
      
      return {
        statusCode: 200,
        body: fullUpdatedSchool
      }
    }
    
    // DELETE - удаление школы
    if (method === 'DELETE') {
      // Проверяем существование школы
      const existingSchool = await prisma.school.findUnique({
        where: { id }
      })
      
      if (!existingSchool) {
        return {
          statusCode: 404,
          body: { message: 'Школа не найдена' }
        }
      }
      
      // Удаляем связанные данные
      await prisma.$transaction([
        prisma.educationalProgram.deleteMany({ where: { schoolId: id } }),
        prisma.schoolPhoto.deleteMany({ where: { schoolId: id } }),
        prisma.review.deleteMany({ where: { schoolId: id } }),
        prisma.savedSchool.deleteMany({ where: { schoolId: id } }),
        prisma.school.delete({ where: { id } })
      ])
      
      return {
        statusCode: 200,
        body: { message: 'Школа успешно удалена' }
      }
    }
    
    // Если метод не поддерживается
    return {
      statusCode: 405,
      body: { message: 'Метод не поддерживается' }
    }
    
  } catch (error) {
    console.error('Ошибка при обработке запроса к школе:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 