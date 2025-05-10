export default defineNuxtRouteMiddleware(async (to, from) => {
  // Проверяем, что мы на клиенте
  if (!process.client) {
    return
  }
  
  // Избегаем бесконечный цикл перенаправлений
  if (to.path === '/login') {
    return
  }
  
  // Проверяем, есть ли токен в localStorage
  const token = localStorage.getItem('token')
  
  if (!token) {
    // Если токена нет, перенаправляем на страницу входа
    console.log("Нет токена, перенаправляем на /login")
    return navigateTo('/login')
  }
  
  try {
    // Проверка существующего пользователя в localStorage
    const userStr = localStorage.getItem('user')
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr)
        if (user && user.id) {
          // Если есть данные пользователя, считаем авторизацию успешной
          console.log("Проверка auth middleware: пользователь валидный из localStorage")
          return
        }
      } catch (e) {
        console.error("Ошибка парсинга данных пользователя:", e)
      }
    }
    
    // Если нет кэшированных данных пользователя или они некорректны, проверяем токен
    console.log("Проверка auth middleware: проверяем токен через API")
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      console.error(`Ошибка API: ${response.status} ${response.statusText}`)
      throw new Error('Ошибка при проверке токена')
    }
    
    const userData = await response.json()
    
    // Проверяем, что в ответе есть данные пользователя
    if (!userData || !userData.body || !userData.body.id) {
      console.error('Данные пользователя отсутствуют или некорректны:', userData)
      throw new Error('Ошибка при получении данных пользователя')
    }
    
    // Сохраняем данные пользователя в localStorage для будущих проверок
    localStorage.setItem('user', JSON.stringify(userData.body))
    console.log("Проверка auth middleware: пользователь успешно получен и сохранен")
    
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error)
    // Очищаем токен при ошибке
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return navigateTo('/login')
  }
}) 