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
    // Проверяем валидность токена
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Ошибка при проверке токена')
    }
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error)
    return navigateTo('/login')
  }
}) 