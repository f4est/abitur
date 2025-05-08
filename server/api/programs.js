import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Извлекаем параметры запроса
    const query = getQuery(event)
    const search = query.search || ''
    
    // Получаем образовательные программы
    const programs = await prisma.educationalProgram.findMany({
      where: {
        name: {
          contains: search
        }
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        duration: true,
        price: true,
        schoolId: true,
        school: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return {
      body: programs
    }
  } catch (error) {
    console.error('Ошибка при получении образовательных программ:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 