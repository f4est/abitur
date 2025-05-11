import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { verifyToken } from '../../utils/auth'
import prisma from '../../utils/prisma'

// Допустимые типы файлов для загрузки изображений
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
]

// Максимальный размер загружаемого файла (5 МБ)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Создает директорию, если она не существует
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    console.log(`Создание директории: ${directory}`)
    fs.mkdirSync(directory, { recursive: true })
    return true
  }
  return false
}

// Обработка загрузки файла
export default defineEventHandler(async (event) => {
  console.log('API upload/index.post: Начало обработки POST-запроса')
  
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      console.log('API upload/index.post: Ошибка авторизации')
      setResponseStatus(event, 401)
      return {
        status: 401,
        message: 'Требуется авторизация'
      }
    }
    
    // Проверяем права администратора для определенных типов загрузки
    const isAdmin = user.role === 'ADMIN'
    console.log(`API upload/index.post: Пользователь ${user.id}, роль: ${user.role}`)
    
    // Получаем multipart/form-data
    const formData = await readMultipartFormData(event)
    console.log(`API upload/index.post: Получен formData, количество частей: ${formData ? formData.length : 0}`)
    
    if (!formData || !formData.length) {
      console.log('API upload/index.post: Файлы не найдены в запросе')
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Файл не загружен'
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
    
    console.log(`API upload/index.post: Тип загрузки: ${uploadType}`)
    
    // Проверяем права доступа для определенных типов файлов
    if ((['logo', 'school'].includes(uploadType)) && !isAdmin) {
      console.log('API upload/index.post: Недостаточно прав для загрузки этого типа файлов')
      setResponseStatus(event, 403)
      return {
        status: 403,
        message: 'Доступ запрещен. Требуются права администратора для этого типа файлов.'
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
    
    // Создаем базовую директорию для загрузок
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads')
    ensureDirectoryExists(baseUploadDir)
    
    // Создаем директорию для загрузки конкретного типа
    ensureDirectoryExists(uploadDir)
    
    // Получаем файл из формы
    const file = formData.find(item => item.name === 'file' || item.filename)
    
    if (!file) {
      console.log('API upload/index.post: Файл не найден в multipart/form-data')
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: 'Файл не найден в запросе'
      }
    }
    
    console.log(`API upload/index.post: Получен файл, тип: ${file.type}, размер: ${file.data ? file.data.length : 0} байт`)
    
    // Проверяем тип файла
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log(`API upload/index.post: Недопустимый тип файла: ${file.type}`)
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: `Недопустимый тип файла: ${file.type}. Разрешены только JPEG, PNG, WebP и SVG.`
      }
    }
    
    // Проверяем размер файла
    if (file.data.length > MAX_FILE_SIZE) {
      console.log(`API upload/index.post: Превышен размер файла: ${file.data.length} > ${MAX_FILE_SIZE}`)
      setResponseStatus(event, 400)
      return {
        status: 400,
        message: `Размер файла превышает допустимый (5 МБ). Текущий размер: ${Math.round(file.data.length / 1024 / 1024 * 100) / 100} МБ`
      }
    }
    
    // Генерируем уникальное имя файла
    const fileExtension = file.filename?.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)
    
    // Записываем файл
    console.log(`API upload/index.post: Записываем файл: ${filePath}`)
    try {
      fs.writeFileSync(filePath, file.data)
    } catch (error) {
      console.error(`API upload/index.post: Ошибка записи файла: ${error.message}`)
      setResponseStatus(event, 500)
      return {
        status: 500,
        message: `Ошибка записи файла: ${error.message}`
      }
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
    
    console.log(`API upload/index.post: Файл успешно сохранен, URL: ${fileUrl}`)
    
    // Если это аватар пользователя, обновляем запись в базе данных
    if (uploadType === 'avatar') {
      // Получаем текущего пользователя из базы данных
      console.log(`API upload/index.post: Обновляем аватар пользователя, ID: ${user.id}`)
      try {
        const currentUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { avatarUrl: true }
        })
        
        if (currentUser && currentUser.avatarUrl) {
          // Удаляем старый файл, если он существует и находится в нашей директории
          try {
            const oldAvatarPath = currentUser.avatarUrl
            if (oldAvatarPath && oldAvatarPath.startsWith('/uploads/avatars/')) {
              const oldFileName = oldAvatarPath.split('/').pop()
              const oldFilePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', oldFileName)
              
              if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath)
                console.log(`API upload/index.post: Удален старый аватар: ${oldFilePath}`)
              }
            }
          } catch (deleteError) {
            console.error(`API upload/index.post: Ошибка при удалении старого аватара: ${deleteError.message}`)
          }
        }
        
        // Обновляем URL аватара в базе данных
        await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: fileUrl }
        })
        
        console.log(`API upload/index.post: Аватар пользователя обновлен в базе данных: ${fileUrl}`)
      } catch (dbError) {
        console.error(`API upload/index.post: Ошибка работы с базой данных: ${dbError.message}`)
        // Мы продолжаем выполнение, так как файл уже загружен
      }
    }
    
    // Возвращаем URL загруженного файла
    setResponseStatus(event, 200)
    return {
      status: 200,
      message: 'Файл успешно загружен',
      url: fileUrl,
      name: file.filename || fileName,
      type: uploadType
    }
  } catch (error) {
    console.error('API upload/index.post: Критическая ошибка:', error)
    setResponseStatus(event, 500)
    return {
      status: 500,
      message: 'Ошибка при загрузке файла', 
      error: error.message
    }
  }
}) 