// Эндпоинт API для загрузки файлов
// GET-запросы перенаправляет на документацию, POST-запросы обрабатываются в index.post.js

export default defineEventHandler((event) => {
  // Информация о доступных методах API загрузки
  return {
    message: 'API загрузки файлов',
    endpoints: {
      'POST /api/upload': 'Загрузка файла. Требуется multipart/form-data с полем file и опциональным полем type (logo, school, avatar, general)',
      'GET /api/upload': 'Информация о API загрузки'
    },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxFileSize: '5MB'
  }
}) 