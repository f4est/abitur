import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем данные из query параметров
    const query = getQuery(event)
    const search = query.search || ''
    
    // Получаем список всех учебных заведений
    const schools = await prisma.school.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      },
      select: {
        id: true,
        name: true,
        address: true,
        logoUrl: true,
        description: true,
        _count: {
          select: {
            programs: true,
            photos: true,
            savedByUsers: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return {
      body: schools
    }
  } catch (error) {
    console.error('Ошибка при получении списка учебных заведений:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 