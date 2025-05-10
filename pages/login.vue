<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-skyway/10 to-ashleigh/5">
    <div class="max-w-md w-full space-y-8 rounded-xl bg-white shadow-xl p-8 border border-skyway/20">
      <div>
        <h1 class="text-3xl font-bold text-center text-ashleigh">Вход в систему</h1>
        <p class="mt-2 text-center text-gray-700">
          Войдите в свой аккаунт или <NuxtLink to="/register" class="text-ashleigh font-medium hover:underline">зарегистрируйтесь</NuxtLink>
        </p>
      </div>
      
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md">
        {{ errorMessage }}
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="login">
        <div class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              id="email" 
              v-model="formData.email" 
              type="email" 
              required 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none transition" 
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input 
              id="password" 
              v-model="formData.password" 
              type="password" 
              required 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none transition" 
              placeholder="********"
            />
            <div class="flex justify-end mt-1">
              <NuxtLink to="/forgot-password" class="text-sm text-ashleigh hover:underline">Забыли пароль?</NuxtLink>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button 
            type="submit" 
            class="w-full py-3 px-4 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashleigh"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Загрузка...
            </span>
            <span v-else>Войти</span>
          </button>
        </div>
      </form>
      
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const formData = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const login = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Вызываем API для входа
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    
    const data = await response.json()
    console.log('Данные, полученные от сервера:', data)
    
    if (response.ok) {
      // Получаем данные пользователя и токен напрямую из ответа
      const { user, token } = data
      
      if (!user || !token) {
        console.error('Неверный формат ответа от сервера:', data)
        errorMessage.value = 'Ошибка входа: некорректный ответ от сервера'
        return
      }
      
      console.log('Сохраняем данные пользователя:', user)
      console.log('Роль пользователя:', user.role)
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Вызываем событие для обновления DOM и сохранения в других вкладках
      window.dispatchEvent(new Event('storage'))
      
      // Перенаправляем на главную или админ-панель
      if (user.role === 'ADMIN') {
        console.log('Перенаправляем на админ-панель')
        router.push('/admin')
      } else {
        console.log('Перенаправляем на главную')
        router.push('/')
      }
    } else {
      errorMessage.value = data.message || 'Ошибка входа. Пожалуйста, проверьте ваши учетные данные.'
    }
  } catch (error) {
    console.error('Ошибка входа:', error)
    errorMessage.value = 'Произошла ошибка при входе. Пожалуйста, попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Вход - Платформа для абитуриентов'
})
</script> 