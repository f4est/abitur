import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { verifyToken } from '../utils/auth'
import prisma from '../utils/prisma'

// Допустимые типы файлов для загрузки изображений
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]

// Максимальный размер загружаемого файла (5 МБ)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Функция для удаления старого аватара
const deleteOldAvatar = (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return false;
  
  try {
    // Получаем имя файла из URL
    const fileName = avatarUrl.split('/').pop();
    // Полный путь к файлу
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', fileName);

    // Проверяем, существует ли файл
    if (fs.existsSync(filePath)) {
      // Удаляем файл
      fs.unlinkSync(filePath);
      console.log(`Удален старый аватар: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error('Ошибка при удалении старого аватара:', error);
  }
  
  return false;
}

export default defineEventHandler(async (event) => {
  console.log('API upload: Начало обработки запроса');
  
  try {
    // Проверяем аутентификацию
    const user = verifyToken(event);
    if (!user) {
      console.log('API upload: Ошибка авторизации');
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    console.log(`API upload: Пользователь авторизован, ID: ${user.id}`);

    // Получаем multipart/form-data
    const formData = await readMultipartFormData(event);
    console.log(`API upload: Получен formData, количество файлов: ${formData ? formData.length : 0}`);
    
    if (!formData || !formData.length) {
      return {
        statusCode: 400,
        body: { message: 'Файл не загружен' }
      }
    }

    // Получаем первый файл из формы
    const file = formData[0];
    console.log(`API upload: Получен файл, тип: ${file.type}, размер: ${file.data ? file.data.length : 0} байт`);

    // Проверяем тип файла
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log(`API upload: Недопустимый тип файла: ${file.type}`);
      return {
        statusCode: 400,
        body: { message: `Недопустимый тип файла: ${file.type}. Разрешены только JPEG, PNG, GIF и WebP.` }
      }
    }

    // Проверяем размер файла
    if (file.data.length > MAX_FILE_SIZE) {
      console.log(`API upload: Превышен размер файла: ${file.data.length} > ${MAX_FILE_SIZE}`);
      return {
        statusCode: 400,
        body: { message: `Размер файла превышает допустимый (5 МБ). Текущий размер: ${Math.round(file.data.length / 1024 / 1024 * 100) / 100} МБ` }
      }
    }

    // Создаем директорию для загрузок, если она не существует
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      console.log(`API upload: Создаем директорию: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Создаем директорию для аватаров, если она не существует
    const avatarsDir = path.join(uploadDir, 'avatars');
    if (!fs.existsSync(avatarsDir)) {
      console.log(`API upload: Создаем директорию: ${avatarsDir}`);
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    // Получаем текущего пользователя из базы данных
    console.log(`API upload: Получаем данные пользователя из базы данных, ID: ${user.id}`);
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true }
    });
    console.log(`API upload: Текущий аватар пользователя: ${currentUser?.avatarUrl || 'отсутствует'}`);

    // Если у пользователя уже есть аватар, удаляем его
    if (currentUser && currentUser.avatarUrl) {
      console.log(`API upload: Пытаемся удалить предыдущий аватар: ${currentUser.avatarUrl}`);
      const deleted = deleteOldAvatar(currentUser.avatarUrl);
      console.log(`API upload: Удаление предыдущего аватара: ${deleted ? 'успешно' : 'не требуется'}`);
    }

    // Генерируем уникальное имя файла
    const fileExtension = file.filename?.split('.').pop() || 'jpg';
    const fileName = `${randomUUID()}.${fileExtension}`;
    console.log(`API upload: Новое имя файла: ${fileName}`);
    
    // Полный путь к файлу
    const filePath = path.join(avatarsDir, fileName);
    
    // Записываем файл
    console.log(`API upload: Записываем файл: ${filePath}`);
    fs.writeFileSync(filePath, file.data);
    
    // Относительный URL файла
    const fileUrl = `/uploads/avatars/${fileName}`;
    console.log(`API upload: URL файла: ${fileUrl}`);
    
    // Обновляем URL аватара в базе данных
    console.log(`API upload: Обновляем URL аватара в базе данных`);
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: fileUrl }
    });
    
    console.log(`API upload: Успешное завершение`);
    return {
      body: {
        url: fileUrl,
        fileName: fileName
      }
    }
  } catch (error) {
    console.error('API upload: Ошибка:', error);
    return {
      statusCode: 500,
      body: { message: `Ошибка при загрузке файла: ${error.message}` }
    }
  }
}) 