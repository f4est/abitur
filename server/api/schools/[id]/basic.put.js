import { verifyToken } from '../../../utils/auth'
import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API schools/[id]/basic: Начало обработки PUT-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API schools/[id]/basic: Ошибка авторизации')
      setResponseStatus(event, 401)
      return {
        status: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API schools/[id]/basic: Недостаточно прав')
      setResponseStatus(event, 403)
      return {
        status: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем ID школы из параметров URL
    const schoolId = parseInt(event.context.params.id)
    if (isNaN(schoolId)) {
      console.log(`API schools/[id]/basic: Неверный ID школы: ${event.context.params.id}`)
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Неверный ID школы'
      }
    }
    
    console.log(`API schools/[id]/basic: Обновление школы с ID ${schoolId}`)
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    console.log('API schools/[id]/basic: Получены данные:', body)
    
    // Проверяем существование школы
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId }
    })
    
    if (!existingSchool) {
      console.log(`API schools/[id]/basic: Школа с ID ${schoolId} не найдена`)
      setResponseStatus(event, 404)
      return {
        status: 404,
        message: `Школа с ID ${schoolId} не найдена`
      }
    }
    
    // Подготавливаем данные для обновления
    const updateData = {}
    
    // Базовые поля
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber
    if (body.email !== undefined) updateData.email = body.email
    if (body.website !== undefined) updateData.website = body.website
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl
    if (body.category !== undefined) updateData.category = body.category
    
    // Обработка поля contacts
    if (body.contacts !== undefined) {
      try {
        // Проверяем, является ли contacts строкой JSON или объектом
        const contacts = typeof body.contacts === 'string' 
          ? JSON.parse(body.contacts) 
          : body.contacts;
        
        console.log('API schools/[id]/basic: Обработка контактных данных:', contacts);
        
        // Записываем контакты как JSON-строку
        updateData.contacts = typeof body.contacts === 'string' 
          ? body.contacts 
          : JSON.stringify(body.contacts);
          
        // Обновляем отдельные поля из структуры contacts
        if (contacts.fax) updateData.faxNumber = contacts.fax;
        if (contacts.messengers) updateData.messengers = JSON.stringify(contacts.messengers);
        if (contacts.workingHours) updateData.workingHours = contacts.workingHours;
        if (contacts.socialNetworks) updateData.socialNetworks = JSON.stringify(contacts.socialNetworks);
        if (contacts.phones) updateData.additionalPhones = JSON.stringify(contacts.phones);
      } catch (error) {
        console.error('API schools/[id]/basic: Ошибка обработки contacts:', error.message);
      }
    }
    
    // Дополнительные поля
    if (body.additionalPhones !== undefined) updateData.additionalPhones = body.additionalPhones
    if (body.faxNumber !== undefined) updateData.faxNumber = body.faxNumber
    if (body.messengers !== undefined) updateData.messengers = body.messengers
    if (body.workingHours !== undefined) updateData.workingHours = body.workingHours
    if (body.socialNetworks !== undefined) updateData.socialNetworks = body.socialNetworks
    
    // Сохраняем фотографии, если они есть в запросе
    if (body.photos && Array.isArray(body.photos)) {
      console.log(`API schools/[id]/basic: Получены фотографии: ${body.photos.length} шт.`)
      
      try {
        // Сначала удалим все существующие фотографии для этой школы
        await prisma.schoolPhoto.deleteMany({
          where: { schoolId: schoolId }
        })
        
        // Затем создадим новые записи для каждой фотографии
        const photoPromises = body.photos.map(photo => 
          prisma.schoolPhoto.create({
            data: {
              url: photo.url,
              description: photo.description || '',
              schoolId: schoolId
            }
          })
        )
        
        await Promise.all(photoPromises)
        console.log(`API schools/[id]/basic: Сохранено ${body.photos.length} фотографий`)
      } catch (photoError) {
        console.error('API schools/[id]/basic: Ошибка при сохранении фотографий:', photoError)
      }
    }
    
    // Обрабатываем координаты
    if (body.latitude !== undefined && body.longitude !== undefined) {
      // Если указаны оба параметра как отдельные поля
      if (!isNaN(parseFloat(body.latitude)) && !isNaN(parseFloat(body.longitude))) {
        updateData.latitude = parseFloat(body.latitude);
        updateData.longitude = parseFloat(body.longitude);
        console.log(`API schools/[id]/basic: Обновление координат из latitude/longitude: ${updateData.latitude}, ${updateData.longitude}`)
      }
    } else if (body.location) {
      // Обрабатываем объект location, если он есть
      if (typeof body.location === 'object' && body.location.lat && body.location.lng) {
        // Если location - это объект с lat и lng
        if (!isNaN(parseFloat(body.location.lat)) && !isNaN(parseFloat(body.location.lng))) {
          updateData.latitude = parseFloat(body.location.lat);
          updateData.longitude = parseFloat(body.location.lng);
          console.log(`API schools/[id]/basic: Обновление координат из location объекта: ${updateData.latitude}, ${updateData.longitude}`)
        }
      } else if (typeof body.location === 'string') {
        // Если location - это строка "lat,lng"
        try {
          const [lat, lng] = body.location.split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            updateData.latitude = lat;
            updateData.longitude = lng;
            console.log(`API schools/[id]/basic: Обновление координат из location строки: ${updateData.latitude}, ${updateData.longitude}`)
          }
        } catch (error) {
          console.error(`API schools/[id]/basic: Ошибка парсинга строки координат: ${error.message}`);
        }
      }
    } else if (body.coordinates) {
      // Обрабатываем поле coordinates, если оно есть
      try {
        if (typeof body.coordinates === 'string') {
          const [lat, lng] = body.coordinates.split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            updateData.latitude = lat;
            updateData.longitude = lng;
            console.log(`API schools/[id]/basic: Обновление координат из поля coordinates: ${updateData.latitude}, ${updateData.longitude}`)
          }
        }
      } catch (error) {
        console.error(`API schools/[id]/basic: Ошибка парсинга поля coordinates: ${error.message}`);
      }
    }
    
    console.log('API schools/[id]/basic: Данные для обновления:', updateData)
    
    try {
      // Обновляем основную информацию о школе
      const updatedSchool = await prisma.school.update({
        where: { id: schoolId },
        data: updateData
      })
      
      console.log(`API schools/[id]/basic: Школа успешно обновлена: ${updatedSchool.id}`, JSON.stringify(updatedSchool, null, 2))
      
      // Загружаем полные данные школы, включая фотографии
      const schoolWithPhotos = await prisma.school.findUnique({
        where: { id: updatedSchool.id },
        include: {
          photos: true
        }
      })
      
      // Возвращаем обновленные данные
      setResponseStatus(event, 200)
      return {
        status: 200,
        message: 'Основная информация о школе успешно обновлена',
        data: schoolWithPhotos
      }
    } catch (dbError) {
      console.error('API schools/[id]/basic: Ошибка при обновлении в базе данных:', dbError)
      setResponseStatus(event, 500)
      return {
        status: 500,
        message: 'Ошибка при обновлении информации о школе в базе данных',
        error: dbError.message
      }
    }
  } catch (error) {
    console.error('API schools/[id]/basic: Ошибка:', error)
    console.error('API schools/[id]/basic: Стек ошибки:', error.stack)
    
    // Более подробная информация об ошибке для отладки
    let errorDetails = 'Неизвестная ошибка';
    
    if (error.code) {
      errorDetails = `Код ошибки: ${error.code}`;
      
      if (error.code === 'P2002') {
        errorDetails += ' - Нарушение уникальности';
      } else if (error.code === 'P2003') {
        errorDetails += ' - Нарушение ограничения внешнего ключа';
      } else if (error.code === 'P2025') {
        errorDetails += ' - Запись не найдена';
      }
    }
    
    setResponseStatus(event, 500)
    return {
      status: 500,
      message: 'Ошибка при обновлении информации о школе',
      error: error.message,
      details: errorDetails
    }
  }
}) 