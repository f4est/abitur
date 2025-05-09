import jwt from 'jsonwebtoken'

/**
 * Проверяет JWT токен из заголовка авторизации и возвращает данные пользователя
 * @param {Object} event - Объект события Nuxt
 * @returns {Object|null} - Данные пользователя или null, если токен недействителен
 */
export function verifyToken(event) {
  try {
    // Получаем токен из заголовка авторизации
    const authHeader = getRequestHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split(' ')[1]
    const config = useRuntimeConfig()

    // Проверяем токен
    const decoded = jwt.verify(token, config.JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('Ошибка проверки токена:', error)
    return null
  }
}

/**
 * Проверяет, является ли пользователь администратором
 * @param {Object} user - Данные пользователя из токена
 * @returns {boolean} - true, если пользователь админ, иначе false
 */
export function isAdmin(user) {
  return user && user.role === 'ADMIN'
} 