<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-skyway/10 to-ashleigh/5">
    <div class="max-w-md w-full space-y-8 rounded-xl bg-white shadow-xl p-8 border border-skyway/20">
      <div>
        <h1 class="text-3xl font-bold text-center text-ashleigh">Регистрация</h1>
        <p class="mt-2 text-center text-gray-700">
          Уже есть аккаунт? <NuxtLink to="/login" class="text-ashleigh font-medium hover:underline">Войти</NuxtLink>
        </p>
      </div>
      
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md">
        {{ errorMessage }}
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="register">
        <div class="space-y-5">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input 
              id="name" 
              v-model="formData.name" 
              type="text" 
              required 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none transition" 
              placeholder="Иван Иванов"
            />
          </div>
          
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
              @input="checkPasswordStrength"
            />

            <!-- Индикатор сложности пароля -->
            <div class="mt-3">
              <div class="flex items-center mb-2">
                <div class="mr-2 flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-300" 
                    :class="{
                      'bg-red-500': passwordStrength === 'weak',
                      'bg-yellow-500': passwordStrength === 'medium',
                      'bg-green-500': passwordStrength === 'strong'
                    }"
                    :style="{ width: passwordStrengthWidth }"
                  ></div>
                </div>
                <span class="text-xs font-medium"
                  :class="{
                    'text-red-500': passwordStrength === 'weak',
                    'text-yellow-500': passwordStrength === 'medium',
                    'text-green-500': passwordStrength === 'strong'
                  }"
                >
                  {{ passwordStrengthText }}
                </span>
              </div>
              <ul class="text-xs text-gray-700 grid grid-cols-2 gap-y-1">
                <li class="flex items-center">
                  <svg v-if="hasLength" class="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  • Минимум 8 символов
                </li>
                <li class="flex items-center">
                  <svg v-if="hasUpperCase" class="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  • Заглавная буква
                </li>
                <li class="flex items-center">
                  <svg v-if="hasLowerCase" class="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  • Строчная буква
                </li>
                <li class="flex items-center">
                  <svg v-if="hasNumber" class="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  • Цифра
                </li>
                <li class="flex items-center">
                  <svg v-if="hasSpecialChar" class="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  • Спецсимвол (!@#$%^&*)
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
            <input 
              id="confirmPassword" 
              v-model="formData.confirmPassword" 
              type="password" 
              required 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none transition" 
              placeholder="********"
            />
            <p v-if="!passwordsMatch && formData.confirmPassword" class="mt-1 text-sm text-red-600">
              Пароли не совпадают
            </p>
          </div>
        </div>

        <div class="pt-2">
          <button 
            type="submit" 
            class="w-full py-3 px-4 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashleigh"
            :class="[
              'w-full py-3 px-4 rounded-lg transition font-medium',
              passwordStrength !== 'weak' && passwordsMatch
                ? 'bg-ashleigh text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-700 cursor-not-allowed'
            ]"
            :disabled="isLoading || !passwordsMatch || passwordStrength === 'weak'"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Загрузка...
            </span>
            <span v-else>Зарегистрироваться</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const passwordStrength = ref('weak')
const hasLength = ref(false)
const hasUpperCase = ref(false)
const hasLowerCase = ref(false)
const hasNumber = ref(false)
const hasSpecialChar = ref(false)

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 'weak':
      return 'Слабый'
    case 'medium':
      return 'Средний'
    case 'strong':
      return 'Сильный'
    default:
      return ''
  }
})

const passwordStrengthWidth = computed(() => {
  switch (passwordStrength.value) {
    case 'weak':
      return '33%'
    case 'medium':
      return '66%'
    case 'strong':
      return '100%'
    default:
      return '0%'
  }
})

const passwordsMatch = computed(() => {
  if (!formData.confirmPassword) return true
  return formData.password === formData.confirmPassword
})

// Проверка сложности пароля
const checkPasswordStrength = () => {
  const password = formData.password

  hasLength.value = password.length >= 8
  hasUpperCase.value = /[A-Z]/.test(password)
  hasLowerCase.value = /[a-z]/.test(password)
  hasNumber.value = /[0-9]/.test(password)
  hasSpecialChar.value = /[!@#$%^&*]/.test(password)

  // Подсчет положительных проверок
  const checks = [hasLength.value, hasUpperCase.value, hasLowerCase.value, hasNumber.value, hasSpecialChar.value]
  const passedChecks = checks.filter(check => check).length

  // Определение сложности пароля
  if (passedChecks <= 2) {
    passwordStrength.value = 'weak'
  } else if (passedChecks <= 4) {
    passwordStrength.value = 'medium'
  } else {
    passwordStrength.value = 'strong'
  }
}

// Регистрация пользователя
const register = async () => {
  if (!passwordsMatch.value) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }

  if (passwordStrength.value === 'weak') {
    errorMessage.value = 'Пароль слишком слабый'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Вызываем событие для обновления DOM и сохранения в других вкладках
      window.dispatchEvent(new Event('storage'))
      
      // Перенаправляем на главную
      navigateTo('/')
    } else {
      errorMessage.value = data.message || 'Ошибка регистрации. Пожалуйста, попробуйте позже.'
    }
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    errorMessage.value = 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Регистрация - Платформа для абитуриентов'
})
</script> 