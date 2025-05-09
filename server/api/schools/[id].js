import prisma from '../../utils/prisma'
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
          programs: true
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
      const { programs, email, phone, ...restData } = body
      
      // Комбинируем email и phone в поле contacts, если они есть
      const contactsData = {}
      if (email || phone) {
        let contactsStr = '';
        if (email) contactsStr += `Email: ${email}`;
        if (email && phone) contactsStr += ', ';
        if (phone) contactsStr += `Телефон: ${phone}`;
        contactsData.contacts = contactsStr || existingSchool.contacts;
      }

      // Формируем итоговый объект для обновления
      const schoolData = {
        ...restData,
        ...contactsData
      }
      
      // Обновляем основные данные школы
      const updatedSchool = await prisma.school.update({
        where: { id },
        data: schoolData
      })
      
      // Если есть данные о программах, обновляем их
      if (Array.isArray(programs)) {
        // Получаем существующие ID программ
        const existingProgramIds = existingSchool.programs.map(p => p.id);
        
        // Определяем какие программы нужно обновить, а какие создать
        const programsToUpdate = programs.filter(p => p.id && existingProgramIds.includes(p.id));
        const programsToCreate = programs.filter(p => !p.id || !existingProgramIds.includes(p.id));
        
        // ID программ, которые мы собираемся обновить
        const programIdsToUpdate = programsToUpdate.map(p => p.id);
        
        // Программы, которые нужно удалить (те, что есть в базе, но нет в запросе)
        const programIdsToDelete = existingProgramIds.filter(id => !programIdsToUpdate.includes(id));
        
        // Удаляем программы, которых нет в запросе
        if (programIdsToDelete.length > 0) {
          await prisma.educationalProgram.deleteMany({
            where: {
              id: {
                in: programIdsToDelete
              }
            }
          });
        }
        
        // Обновляем существующие программы
        for (const program of programsToUpdate) {
          await prisma.educationalProgram.update({
            where: { id: program.id },
            data: {
              name: program.name,
              code: program.code || '',
              description: program.description || '',
              duration: program.duration || '',
              price: program.price ? parseFloat(program.price) : null
            }
          });
        }
        
        // Создаем новые программы
        for (const program of programsToCreate) {
          if (program.name && program.name.trim()) {
            await prisma.educationalProgram.create({
              data: {
                name: program.name.trim(),
                code: program.code || '',
                description: program.description || '',
                duration: program.duration || '',
                price: program.price ? parseFloat(program.price) : null,
                schoolId: id
              }
            });
          }
        }
      }
      
      // Получаем обновленные данные школы с программами
      const fullUpdatedSchool = await prisma.school.findUnique({
        where: { id },
        include: {
          programs: true,
          photos: true
        }
      });
      
      // Извлекаем email и телефон из поля contacts
      let updatedEmail = '';
      let updatedPhone = '';
      
      if (fullUpdatedSchool.contacts) {
        const emailMatch = fullUpdatedSchool.contacts.match(/Email: ([^,]+)/i);
        if (emailMatch && emailMatch[1]) {
          updatedEmail = emailMatch[1].trim();
        }
        
        const phoneMatch = fullUpdatedSchool.contacts.match(/Телефон: ([^,]+)/i);
        if (phoneMatch && phoneMatch[1]) {
          updatedPhone = phoneMatch[1].trim();
        }
      }
      
      // Форматируем ответ, добавляя поля email и phone для удобства клиента
      const formattedUpdatedSchool = {
        ...fullUpdatedSchool,
        email: updatedEmail,
        phone: updatedPhone
      };
      
      return {
        statusCode: 200,
        body: formattedUpdatedSchool
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