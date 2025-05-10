import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

// Создаем состояние авторизации с использованием реактивных примитивов
const token = ref(null)
const user = ref(null)
const isAuthenticated = computed(() => !!token.value)
const isAdmin = ref(false)
const isLoading = ref(false)
const error = ref(null)

// Получаем состояние из localStorage при инициализации на клиенте
if (process.client) {
  try {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken) {
      token.value = savedToken
      try {
        if (savedUser) {
          user.value = JSON.parse(savedUser)
          isAdmin.value = user.value && user.value.role === 'ADMIN'
        }
      } catch (error) {
        console.error('Ошибка при парсинге данных пользователя:', error)
        // Сбрасываем данные при ошибке
        resetAuthState()
      }
    }
  } catch (e) {
    console.error('Ошибка при инициализации состояния авторизации:', e)
  }
}

// Функция для сброса состояния
function resetAuthState() {
  token.value = null
  user.value = null
  isAdmin.value = false
  if (process.client) {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {
      console.error('Ошибка при очистке localStorage:', e)
    }
  }
}

export const useAuth = () => {
  const router = useRouter()
  
  // Функция для входа пользователя
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Ошибка входа. Статус: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Проверяем корректность полученных данных
      if (!data || !data.token || !data.user) {
        throw new Error('Сервер вернул некорректные данные')
      }
      
      // Проверяем, есть ли новый токен в заголовках
      const newToken = response.headers.get('X-New-Token')
      if (newToken) {
        data.token = newToken
      }
      
      // Сохраняем данные в состоянии и localStorage
      token.value = data.token
      user.value = data.user
      isAdmin.value = data.user.role === 'ADMIN'
      
      if (process.client) {
        try {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          // Вызываем событие для синхронизации между вкладками
          window.dispatchEvent(new Event('storage'))
        } catch (e) {
          console.error('Ошибка при сохранении в localStorage:', e)
        }
      }
      
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Ошибка при входе:', error)
      error.value = error.message || 'Произошла ошибка при попытке входа'
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }
  
  // Функция для выхода пользователя
  const logout = () => {
    resetAuthState()
    
    if (process.client) {
      // Вызываем событие для синхронизации между вкладками
      window.dispatchEvent(new Event('storage'))
    }
    
    // Перенаправляем на главную страницу
    if (router) {
      router.push('/')
    }
  }
  
  // Функция для получения данных текущего пользователя
  const fetchCurrentUser = async () => {
    if (!token.value) return null
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      // Проверяем, есть ли новый токен в заголовках
      const newToken = response.headers.get('X-New-Token')
      if (newToken) {
        token.value = newToken
        if (process.client) {
          try {
            localStorage.setItem('token', newToken)
          } catch (e) {
            console.error('Ошибка при обновлении токена в localStorage:', e)
          }
        }
      }
      
      if (!response.ok) {
        // Если токен недействителен, выходим из системы
        if (response.status === 401) {
          resetAuthState()
        }
        
        const errorData = await response.json()
        throw new Error(errorData.message || `Ошибка запроса. Статус: ${response.status}`)
      }
      
      const userData = await response.json()
      user.value = userData
      isAdmin.value = userData.role === 'ADMIN'
      
      if (process.client) {
        try {
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (e) {
          console.error('Ошибка при сохранении данных пользователя в localStorage:', e)
        }
      }
      
      return userData
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error)
      error.value = error.message || 'Не удалось получить данные пользователя'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    logout,
    fetchCurrentUser,
    resetAuthState
  }
} 