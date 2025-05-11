import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Получаем список школ для проверки базы данных
    const schools = await prisma.school.findMany({
      take: 5
    })
    
    console.log('API test-db: Школы успешно загружены из базы данных', schools)
    
    return {
      success: true,
      message: 'Подключение к базе данных работает',
      count: schools.length,
      schools
    }
  } catch (error) {
    console.error('API test-db: Ошибка при проверке базы данных:', error)
    
    return {
      success: false,
      message: 'Ошибка при проверке базы данных',
      error: error.message
    }
  }
}) 