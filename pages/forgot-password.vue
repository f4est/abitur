<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-skyway/10 to-ashleigh/5">
    <div class="max-w-md w-full space-y-8 rounded-xl bg-white shadow-xl p-8 border border-skyway/20">
      <div>
        <h1 class="text-3xl font-bold text-center text-ashleigh">Восстановление пароля</h1>
        <p class="mt-2 text-center text-gray-700">
          Введите ваш email для восстановления доступа
        </p>
      </div>
      
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-md">
        {{ successMessage }}
        <div v-if="devResetCode" class="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded-md">
          <p class="font-semibold">Код восстановления (только для разработки):</p>
          <div class="text-xl font-mono bg-white p-2 mt-1 text-center">{{ devResetCode }}</div>
        </div>
      </div>

      <div v-if="!resetCodeSent">
        <form class="mt-8 space-y-6" @submit.prevent="sendResetCode">
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
          
          <!-- Добавлено для удобства разработки -->
          <div class="mt-2 bg-blue-50 p-3 rounded-md text-sm">
            <p class="font-medium text-blue-800 mb-1">Доступные тестовые учетные записи:</p>
            <ul class="text-blue-700 ml-4 list-disc">
              <li>admin@example.com (Админ)</li>
              <li>user@example.com (Пользователь)</li>
            </ul>
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
                Отправка...
              </span>
              <span v-else>Отправить код восстановления</span>
            </button>
          </div>
        </form>
      </div>
      
      <div v-else>
        <form class="mt-8 space-y-6" @submit.prevent="resetPassword">
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Код восстановления</label>
            <input 
              id="code" 
              v-model="formData.resetCode" 
              type="text" 
              required 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none transition" 
              placeholder="Введите код из письма"
            />
            <div class="mt-2 flex justify-between items-center">
              <p class="text-xs text-gray-500">Не получили код?</p>
              <button 
                type="button" 
                @click="resendResetCode" 
                class="text-sm text-ashleigh hover:underline"
                :disabled="resendCountdown > 0"
              >
                {{ resendCountdown > 0 ? `Повторная отправка через ${resendCountdown} сек` : 'Отправить код повторно' }}
              </button>
            </div>
          </div>
          
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
            <input 
              id="newPassword" 
              v-model="formData.newPassword" 
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
              <span v-else>Сбросить пароль</span>
            </button>
          </div>
        </form>
      </div>

      <div class="mt-4 text-center">
        <NuxtLink to="/login" class="text-sm text-ashleigh hover:underline">Вернуться на страницу входа</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const formData = reactive({
  email: '',
  resetCode: '',
  newPassword: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const resetCodeSent = ref(false)
const passwordStrength = ref('weak')
const devResetCode = ref('')
const resendCountdown = ref(0)

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
  return formData.newPassword === formData.confirmPassword
})

// Проверка сложности пароля
const checkPasswordStrength = () => {
  const password = formData.newPassword

  const hasLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*]/.test(password)

  // Подсчет положительных проверок
  const checks = [hasLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]
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

// Отправка кода восстановления
const sendResetCode = async () => {
  if (!formData.email) {
    errorMessage.value = 'Введите ваш email'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: formData.email
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      resetCodeSent.value = true
      successMessage.value = 'Код восстановления отправлен на ваш email'
      
      // Для удобства разработки - показываем код на странице
      if (data.body && data.body.resetCode) {
        devResetCode.value = data.body.resetCode
      }
      
      // Устанавливаем таймер обратного отсчета для повторной отправки (60 секунд)
      startResendCountdown()
    } else {
      errorMessage.value = data.body?.message || 'Не удалось отправить код восстановления. Проверьте правильность email.'
    }
  } catch (error) {
    console.error('Ошибка отправки кода восстановления:', error)
    errorMessage.value = 'Произошла ошибка при отправке кода восстановления. Пожалуйста, попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

// Функция запуска таймера обратного отсчета
const startResendCountdown = () => {
  resendCountdown.value = 60 // 60 секунд до возможности повторной отправки
  
  const timer = setInterval(() => {
    resendCountdown.value--
    
    if (resendCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// Функция повторной отправки кода
const resendResetCode = async () => {
  if (resendCountdown.value > 0) return
  
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: formData.email
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      successMessage.value = 'Новый код восстановления отправлен на ваш email'
      
      // Для удобства разработки - показываем код на странице
      if (data.body && data.body.resetCode) {
        devResetCode.value = data.body.resetCode
      }
      
      // Сбрасываем поле с кодом, так как старый код больше не действует
      formData.resetCode = ''
      
      // Запускаем таймер обратного отсчета для повторной отправки
      startResendCountdown()
    } else {
      errorMessage.value = data.body?.message || 'Не удалось отправить код восстановления. Проверьте правильность email.'
    }
  } catch (error) {
    console.error('Ошибка повторной отправки кода восстановления:', error)
    errorMessage.value = 'Произошла ошибка при отправке кода восстановления. Пожалуйста, попробуйте позже.'
  }
}

// Сброс пароля
const resetPassword = async () => {
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
  successMessage.value = ''
  
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: formData.email,
        resetCode: formData.resetCode,
        newPassword: formData.newPassword
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      successMessage.value = 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.'
      // Очистка формы
      formData.resetCode = ''
      formData.newPassword = ''
      formData.confirmPassword = ''
      
      // Через 3 секунды перенаправляем на страницу входа
      setTimeout(() => {
        navigateTo('/login')
      }, 3000)
    } else {
      errorMessage.value = data.body?.message || 'Не удалось сбросить пароль. Проверьте правильность кода восстановления.'
    }
  } catch (error) {
    console.error('Ошибка сброса пароля:', error)
    errorMessage.value = 'Произошла ошибка при сбросе пароля. Пожалуйста, попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Восстановление пароля - Платформа для абитуриентов'
})
</script> 