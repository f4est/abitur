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
  'image/svg+xml',
  'image/webp'
]

// Максимальный размер загружаемого файла (5 МБ)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Обработка загрузки файла
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
    
    // Проверяем права администратора
    if (!isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    // Создаем директорию для загрузки, если она не существует
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    // Получаем multipart/form-data
    const formData = await readMultipartFormData(event)
    
    if (!formData || !formData.length) {
      return {
        statusCode: 400,
        body: { message: 'Файл не загружен' }
      }
    }
    
    // Получаем первый файл из формы
    const file = formData[0]
    
    // Проверяем тип файла
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        statusCode: 400,
        body: { message: `Недопустимый тип файла: ${file.type}. Разрешены только JPEG, PNG, SVG и WebP.` }
      }
    }
    
    // Проверяем размер файла
    if (file.data.length > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        body: { message: `Размер файла превышает допустимый (5 МБ).` }
      }
    }
    
    // Генерируем уникальное имя файла
    const fileExtension = file.filename?.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)
    
    // Записываем файл
    fs.writeFileSync(filePath, file.data)
    
    // Формируем URL для доступа к файлу
    const fileUrl = `/uploads/logos/${fileName}`
    
    // Возвращаем URL загруженного файла
    return {
      statusCode: 200,
      body: {
        message: 'Файл успешно загружен',
        url: fileUrl,
        name: file.filename
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    return {
      statusCode: 500,
      body: { message: 'Ошибка при загрузке файла', error: error.message }
    }
  }
}) 