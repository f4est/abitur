import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
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

// Проверка, является ли пользователь администратором
const isAdmin = (user) => {
  return user && user.role === 'ADMIN'
}

// Допустимые типы файлов для загрузки изображений
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
]

// Максимальный размер загружаемого файла (5 МБ)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Обработка загрузки файла
export default defineEventHandler(async (event) => {
  console.log('API upload/image: Начало обработки запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API upload/image: Ошибка авторизации')
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    // Проверяем права администратора
    if (!isAdmin(user)) {
      console.log('API upload/image: Недостаточно прав')
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    console.log('API upload/image: Пользователь авторизован с правами админа')
    
    // Получаем multipart/form-data
    const formData = await readMultipartFormData(event)
    console.log(`API upload/image: Получен formData, количество файлов: ${formData ? formData.length : 0}`)
    
    if (!formData || !formData.length) {
      console.log('API upload/image: Файлы не найдены в запросе')
      return {
        statusCode: 400,
        body: { message: 'Файл не загружен' }
      }
    }
    
    // Получаем тип загрузки из данных формы, если он предоставлен
    let uploadType = 'general'
    for (const item of formData) {
      if (item.name === 'type' && item.data) {
        uploadType = item.data.toString()
        break
      }
    }
    
    // Определяем директорию для загрузки в зависимости от типа
    let uploadDir
    
    if (uploadType === 'logo') {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    } else if (uploadType === 'school') {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'schools')
    } else if (uploadType === 'avatar') {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    }
    
    // Создаем директорию для загрузки, если она не существует
    if (!fs.existsSync(uploadDir)) {
      console.log(`API upload/image: Создаем директорию: ${uploadDir}`)
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    // Получаем первый файл из формы
    const file = formData.find(item => item.name === 'file' || item.filename)
    
    if (!file) {
      console.log('API upload/image: Файл не найден в multipart/form-data')
      return {
        statusCode: 400,
        body: { message: 'Файл не найден в запросе' }
      }
    }
    
    console.log(`API upload/image: Получен файл, тип: ${file.type}, размер: ${file.data ? file.data.length : 0} байт`)
    
    // Проверяем тип файла
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log(`API upload/image: Недопустимый тип файла: ${file.type}`)
      return {
        statusCode: 400,
        body: { message: `Недопустимый тип файла: ${file.type}. Разрешены только JPEG, PNG, WebP и SVG.` }
      }
    }
    
    // Проверяем размер файла
    if (file.data.length > MAX_FILE_SIZE) {
      console.log(`API upload/image: Превышен размер файла: ${file.data.length} > ${MAX_FILE_SIZE}`)
      return {
        statusCode: 400,
        body: { message: `Размер файла превышает допустимый (5 МБ). Текущий размер: ${Math.round(file.data.length / 1024 / 1024 * 100) / 100} МБ` }
      }
    }
    
    // Генерируем уникальное имя файла
    const fileExtension = file.filename?.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)
    
    // Записываем файл
    console.log(`API upload/image: Записываем файл: ${filePath}`)
    try {
      fs.writeFileSync(filePath, file.data)
    } catch (error) {
      console.error(`API upload/image: Ошибка записи файла: ${error.message}`)
      throw new Error(`Ошибка записи файла: ${error.message}`)
    }
    
    // Формируем URL для доступа к файлу
    let fileUrl
    
    if (uploadType === 'logo') {
      fileUrl = `/uploads/logos/${fileName}`
    } else if (uploadType === 'school') {
      fileUrl = `/uploads/schools/${fileName}`
    } else if (uploadType === 'avatar') {
      fileUrl = `/uploads/avatars/${fileName}`
    } else {
      fileUrl = `/uploads/images/${fileName}`
    }
    
    console.log(`API upload/image: Файл успешно сохранен, URL: ${fileUrl}`)
    
    // Возвращаем URL загруженного файла
    return {
      statusCode: 200,
      body: {
        message: 'Файл успешно загружен',
        url: fileUrl,
        name: file.filename,
        type: uploadType
      }
    }
  } catch (error) {
    console.error('API upload/image: Критическая ошибка:', error)
    return {
      statusCode: 500,
      body: { 
        message: 'Ошибка при загрузке файла', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }
  }
}) 