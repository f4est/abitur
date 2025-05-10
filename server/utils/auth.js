import jwt from 'jsonwebtoken'

/**
 * Проверяет JWT токен из заголовка авторизации и возвращает данные пользователя
 * @param {Object} event - Объект события Nuxt
 * @returns {Object|null} - Данные пользователя или null, если токен недействителен
 */
export const verifyToken = (event) => {
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

/**
 * Проверяет, является ли пользователь администратором
 * @param {Object} user - Данные пользователя из токена
 * @returns {boolean} - true, если пользователь админ, иначе false
 */
export const isAdmin = (user) => {
  return user && user.role === 'ADMIN'
} 