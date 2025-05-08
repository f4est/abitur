import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем ID школы из параметров URL
    const id = parseInt(event.context.params.id)
    
    // Получаем школу из базы данных со всеми связанными данными
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        photos: true,
        programs: {
          include: {
            examRequirements: true
          }
        }
      }
    })
    
    if (!school) {
      return {
        statusCode: 404,
        body: { message: 'Учебное заведение не найдено' }
      }
    }
    
    return {
      statusCode: 200,
      body: school
    }
  } catch (error) {
    console.error('Ошибка при получении учебного заведения:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера' }
    }
  }
}) 