export default defineNuxtRouteMiddleware((to, from) => {
  // Работаем только на клиенте
  if (!process.client) {
    return
  }
  
  // Получаем токен и пользователя
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')

  // Проверяем наличие токена
  if (!token || !userStr) {
    console.log("Middleware admin: Отсутствует токен или данные пользователя")
    return navigateTo('/login')
  }

  // Проверяем роль пользователя
  try {
    const user = JSON.parse(userStr)
    if (user && user.role === 'ADMIN') {
      console.log("Middleware admin: Проверка пройдена, пользователь ADMIN")
      return // Разрешаем доступ
    } else {
      console.log("Middleware admin: Пользователь не является администратором")
      return navigateTo('/')
    }
  } catch (e) {
    console.error("Middleware admin: Ошибка при проверке данных пользователя", e)
    return navigateTo('/login')
  }
}) 