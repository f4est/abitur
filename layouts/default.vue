<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-ashleigh">
          Edugate
        </NuxtLink>
        
        <!-- Мобильное меню-бургер -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen" 
          class="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-ashleigh focus:outline-none"
        >
          <svg 
            :class="mobileMenuOpen ? 'hidden' : 'block'" 
            class="h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg 
            :class="mobileMenuOpen ? 'block' : 'hidden'" 
            class="h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Десктопное меню -->
        <nav class="hidden md:flex items-center space-x-6">
          <NuxtLink to="/" class="text-gray-700 hover:text-ashleigh">
            Главная
          </NuxtLink>
          <NuxtLink to="/catalog" class="text-gray-700 hover:text-ashleigh">
            Каталог
          </NuxtLink>
          <NuxtLink to="/test" class="text-gray-700 hover:text-ashleigh">
            Тест
          </NuxtLink>
          <template v-if="auth.isAuthenticated">
            <NuxtLink to="/profile" class="text-gray-700 hover:text-ashleigh">
              Профиль
            </NuxtLink>
            <NuxtLink v-if="auth.user && auth.user.role === 'ADMIN'" to="/admin" class="text-gray-700 hover:text-ashleigh">
              Админ-панель
            </NuxtLink>
            <button @click="logout" class="text-gray-700 hover:text-ashleigh">
              Выйти
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn btn-primary">
              Войти
            </NuxtLink>
          </template>
        </nav>
      </div>
      
      <!-- Мобильное меню -->
      <div :class="mobileMenuOpen ? 'block' : 'hidden'" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 bg-white shadow-inner border-t">
          <NuxtLink to="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ashleigh hover:bg-gray-50">
            Главная
          </NuxtLink>
          <NuxtLink to="/catalog" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ashleigh hover:bg-gray-50">
            Каталог
          </NuxtLink>
          <NuxtLink to="/test" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ashleigh hover:bg-gray-50">
            Тест
          </NuxtLink>
          <template v-if="auth.isAuthenticated">
            <NuxtLink to="/profile" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ashleigh hover:bg-gray-50">
              Профиль
            </NuxtLink>
            <NuxtLink v-if="auth.user && auth.user.role === 'ADMIN'" to="/admin" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ashleigh hover:bg-gray-50">
              Админ-панель
            </NuxtLink>
            <button @click="logout" class="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ashleigh hover:bg-gray-50">
              Выйти
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="block w-full px-3 py-2 rounded-md text-base font-medium btn btn-primary">
              Войти
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <footer class="bg-ashleigh text-white py-8">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">О проекте</h3>
            <p>
              Edugate — платформа для абитуриентов, помогающая в выборе учебного заведения и профессии.
            </p>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Навигация</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/" class="hover:text-skyway">Главная</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/catalog" class="hover:text-skyway">Каталог</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/test" class="hover:text-skyway">Тест</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-4">Контакты</h3>
            <p>support@edugate.kz</p>
            <p>+7 (999) 999-99-99</p>
          </div>
        </div>
        <div class="mt-8 pt-4 border-t border-skyway text-center">
          <p>&copy; {{ new Date().getFullYear() }} Edugate. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const auth = reactive({
  isAuthenticated: false,
  user: null,
  token: null
})

// Состояние мобильного меню
const mobileMenuOpen = ref(false)

// При монтировании компонента проверяем, есть ли токен в localStorage
onMounted(() => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (token) {
    auth.isAuthenticated = true
    auth.token = token
    
    try {
      // Безопасный парсинг JSON с проверкой
      if (user && user !== 'undefined' && user !== 'null') {
        auth.user = JSON.parse(user)
      } else {
        // Если user некорректный, сбрасываем данные авторизации
        auth.isAuthenticated = false
        auth.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error)
      // В случае ошибки парсинга, сбрасываем данные авторизации
      auth.isAuthenticated = false
      auth.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})

// Функция для выхода
const logout = () => {
  auth.isAuthenticated = false
  auth.user = null
  auth.token = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  navigateTo('/')
}

// Закрытие мобильного меню при изменении маршрута
const route = useRoute()
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script> 