import { verifyToken } from '../../utils/auth'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('API schools/index: Начало обработки POST-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API schools/index: Ошибка авторизации')
      setResponseStatus(event, 401)
      return {
        status: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора
    if (user.role !== 'ADMIN') {
      console.log('API schools/index: Недостаточно прав')
      setResponseStatus(event, 403)
      return {
        status: 403,
        message: 'Доступ запрещен. Требуются права администратора.'
      }
    }
    
    // Получаем данные из тела запроса
    const body = await readBody(event)
    console.log('API schools/index: Получены данные для создания школы:', body)
    
    // Подготавливаем данные для создания
    const schoolData = {
      name: body.name,
      address: body.address,
      description: body.description || '',
      shortDescription: body.shortDescription || '',
      category: body.category || null,
      logoUrl: body.logoUrl || null,
    }
    
    // Устанавливаем контактную информацию
    if (body.email) schoolData.email = body.email
    if (body.phoneNumber || body.phone) schoolData.phoneNumber = body.phoneNumber || body.phone
    if (body.website) schoolData.website = body.website
    
    // Устанавливаем контакты из объекта contacts
    if (body.contacts) {
      try {
        const contactsObj = typeof body.contacts === 'string'
          ? JSON.parse(body.contacts)
          : body.contacts;
          
        schoolData.contacts = typeof body.contacts === 'string'
          ? body.contacts
          : JSON.stringify(body.contacts);
          
        // Обновляем отдельные поля из структуры contacts
        if (contactsObj.fax) schoolData.faxNumber = contactsObj.fax;
        if (contactsObj.messengers) schoolData.messengers = JSON.stringify(contactsObj.messengers);
        if (contactsObj.workingHours) schoolData.workingHours = contactsObj.workingHours;
        if (contactsObj.socialNetworks) schoolData.socialNetworks = JSON.stringify(contactsObj.socialNetworks);
        if (contactsObj.phones) schoolData.additionalPhones = JSON.stringify(contactsObj.phones);
      } catch (error) {
        console.error('API schools/index: Ошибка обработки contacts:', error.message)
      }
    }
    
    // Обрабатываем координаты
    if (body.latitude !== undefined && body.longitude !== undefined) {
      if (!isNaN(parseFloat(body.latitude)) && !isNaN(parseFloat(body.longitude))) {
        schoolData.latitude = parseFloat(body.latitude)
        schoolData.longitude = parseFloat(body.longitude)
      }
    } else if (body.coordinates) {
      try {
        if (typeof body.coordinates === 'string') {
          const [lat, lng] = body.coordinates.split(',').map(coord => parseFloat(coord.trim()))
          if (!isNaN(lat) && !isNaN(lng)) {
            schoolData.latitude = lat
            schoolData.longitude = lng
          }
        } else if (typeof body.coordinates === 'object' && body.coordinates.lat && body.coordinates.lng) {
          schoolData.latitude = parseFloat(body.coordinates.lat)
          schoolData.longitude = parseFloat(body.coordinates.lng)
        }
      } catch (error) {
        console.error('API schools/index: Ошибка обработки координат:', error.message)
      }
    }
    
    console.log('API schools/index: Данные для создания школы:', schoolData)
    
    try {
      // Создаем школу
      const createdSchool = await prisma.school.create({
        data: schoolData
      })
      
      console.log('API schools/index: Школа успешно создана:', createdSchool)
      
      // Обрабатываем фотографии, если они есть
      if (body.photos && Array.isArray(body.photos) && body.photos.length > 0) {
        console.log(`API schools/index: Обработка ${body.photos.length} фотографий`)
        
        try {
          const photoPromises = body.photos.map(photo => 
            prisma.schoolPhoto.create({
              data: {
                url: photo.url,
                description: photo.description || '',
                schoolId: createdSchool.id
              }
            })
          )
          
          await Promise.all(photoPromises)
          console.log(`API schools/index: Сохранено ${body.photos.length} фотографий`)
        } catch (photoError) {
          console.error('API schools/index: Ошибка при сохранении фотографий:', photoError)
        }
      }
      
      // Загружаем полные данные школы, включая фотографии
      const schoolWithPhotos = await prisma.school.findUnique({
        where: { id: createdSchool.id },
        include: {
          photos: true
        }
      })
      
      // Возвращаем созданные данные
      setResponseStatus(event, 201)
      return {
        status: 201,
        message: 'Учебное заведение успешно создано',
        body: schoolWithPhotos
      }
    } catch (dbError) {
      console.error('API schools/index: Ошибка при создании в базе данных:', dbError)
      console.error('API schools/index: Стек ошибки:', dbError.stack)
      
      setResponseStatus(event, 500)
      return {
        status: 500,
        message: 'Ошибка при создании учебного заведения в базе данных',
        error: dbError.message
      }
    }
  } catch (error) {
    console.error('API schools/index: Ошибка:', error)
    console.error('API schools/index: Стек ошибки:', error.stack)
    
    setResponseStatus(event, 500)
    return {
      status: 500,
      message: 'Ошибка при создании учебного заведения',
      error: error.message
    }
  }
}) 