export default defineNuxtRouteMiddleware(async (to, from) => {
  // Проверяем, что мы на клиенте
  if (!process.client) {
    return
  }
  
  // Проверяем, есть ли токен в localStorage
    const token = localStorage.getItem('token')

    // Избегаем бесконечный цикл перенаправлений
    if (to.path === '/login') {
      return
    }

  if (!token) {
    // Если токена нет, перенаправляем на страницу входа
      return navigateTo('/login')
    }

  try {
    // Проверяем, является ли пользователь администратором через API
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Ошибка при проверке статуса администратора')
    }
    
    const data = await response.json()
    
    // Проверяем ответ от API
    if (!data || !data.body || data.body.role !== 'ADMIN') {
      // Если пользователь не является администратором, перенаправляем на главную
      return navigateTo('/')
    }
  } catch (error) {
    console.error('Ошибка проверки прав администратора:', error)
    return navigateTo('/login')
  }
}) 